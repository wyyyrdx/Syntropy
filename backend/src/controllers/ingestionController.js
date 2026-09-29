const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const db = require('../config/db');
const { generateConceptGraph } = require('../../ai/generate');
const { recordActivity } = require('../services/activityService');

/**
 * POST /api/upload
 * Accepts a note image or PDF document and registers it in the system.
 */
async function uploadDocument(req, res) {
  try {
    const rawFiles = Array.isArray(req.files) && req.files.length > 0 
      ? req.files 
      : (req.file ? [req.file] : []);

    if (rawFiles.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No file provided. Please upload one or more files."
      });
    }

    const primaryFile = rawFiles[0];
    const documentId = `doc_${uuidv4().substring(0, 12)}`;
    const filename = primaryFile.originalname || path.basename(primaryFile.path);
    const fileType = primaryFile.mimetype || 'application/octet-stream';
    const totalSize = rawFiles.reduce((acc, f) => acc + (f.size || 0), 0);
    const filePath = primaryFile.path;

    // Insert into documents table
    db.prepare(
      `INSERT INTO documents (id, user_id, filename, file_type, file_size, file_path, status)
       VALUES (?, ?, ?, ?, ?, ?, 'ready')`
    ).run(documentId, req.user.id, filename, fileType, totalSize, filePath);

    const insertPage = db.prepare(
      `INSERT INTO document_pages (id, document_id, page_number, filename, file_type, file_path)
       VALUES (?, ?, ?, ?, ?, ?)`
    );
    rawFiles.forEach((file, index) => {
      insertPage.run(
        uuidv4(),
        documentId,
        index + 1,
        file.originalname || path.basename(file.path),
        file.mimetype || 'application/octet-stream',
        file.path
      );
    });

    // Also link to sessions & notes for backward compatibility
    try {
      const sessionId = documentId;
      const userId = req.user.id;
      db.prepare(
        `INSERT OR IGNORE INTO sessions (id, user_id, status) VALUES (?, ?, 'pending')`
      ).run(sessionId, userId);

      rawFiles.forEach((f, idx) => {
        const pageTitle = rawFiles.length > 1 ? `${filename} (Page ${idx + 1})` : filename;
        db.prepare(
          `INSERT OR IGNORE INTO notes (id, session_id, image_path, subject_title) VALUES (?, ?, ?, ?)`
        ).run(uuidv4(), sessionId, f.path, pageTitle);
      });
    } catch (sessionErr) {
      console.warn('[ingestionController] Legacy session link notice:', sessionErr.message);
    }

    recordActivity(req.user.id);

    return res.status(200).json({
      success: true,
      document_id: documentId,
      filename,
      page_count: rawFiles.length,
      file_type: fileType,
      file_size: totalSize,
      status: 'ready'
    });
  } catch (err) {
    console.error('[ingestionController] uploadDocument error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to upload document.'
    });
  }
}

/**
 * POST /api/generate
 * Triggers AI document parsing and transforms extracted concepts according to selected mode:
 * 'explanation' (2D Dossier) | 'graph' (Concept Matrix) | 'world' (2D RPG Realm)
 */
async function generateKnowledge(req, res) {
  let jobId = null;
  try {
    const { document_id, mode = 'graph' } = req.body;

    if (!document_id) {
      return res.status(400).json({
        success: false,
        error: "Missing required 'document_id' in request body."
      });
    }

    const validModes = ['explanation', 'graph', 'world', 'rpg'];
    const normalizedMode = mode.toLowerCase() === 'rpg' ? 'world' : mode.toLowerCase();

    if (!validModes.includes(mode.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: `Invalid mode '${mode}'. Must be one of: explanation, graph, world, rpg.`
      });
    }

    // Lookup document
    let docPaths = [];
    let docTitle = 'Organic Chemistry: Alkenes';

    if (document_id === 'sample_chemistry') {
      docTitle = 'Organic Chemistry: Alkenes Preparation & Properties';
    } else {
      const doc = db.prepare(`SELECT * FROM documents WHERE id = ? AND user_id = ?`)
        .get(document_id, req.user.id);
      if (doc) {
        const pages = db.prepare(
          `SELECT file_path FROM document_pages WHERE document_id = ? ORDER BY page_number ASC`
        ).all(document_id);
        docPaths = pages.length > 0 ? pages.map((page) => page.file_path) : [doc.file_path];
        docTitle = doc.filename.replace(/\.[^/.]+$/, '');
      } else {
        const notes = db.prepare(
          `SELECT n.* FROM notes n
           JOIN sessions s ON s.id = n.session_id
           WHERE n.session_id = ? AND s.user_id = ?`
        ).all(document_id, req.user.id);
        if (notes.length > 0) {
          docPaths = notes.map((note) => note.image_path);
          docTitle = notes[0].subject_title || 'Uploaded Notes';
        } else {
          return res.status(404).json({
            success: false,
            error: 'Document not found.'
          });
        }
      }
    }

    jobId = `job_${uuidv4().substring(0, 12)}`;

    db.prepare(
      `INSERT INTO generation_jobs (id, user_id, document_id, mode, status)
       VALUES (?, ?, ?, ?, 'processing')`
    ).run(jobId, req.user.id, document_id, normalizedMode);

    // Run synthesis
    let rawGraph = null;
    if (document_id !== 'sample_chemistry') {
      const missingFile = docPaths.find((filePath) => !fs.existsSync(filePath));
      if (missingFile) {
        throw new Error(`An uploaded note page is missing: ${path.basename(missingFile)}`);
      }
      rawGraph = await generateConceptGraph(docPaths);
    }

    // Provide default fallback graph data if AI backend is offline or mock
    if (!rawGraph || !rawGraph.nodes || rawGraph.nodes.length === 0) {
      if (document_id === 'sample_chemistry') {
        rawGraph = {
          subject_title: "Organic Chemistry: Alkenes Preparation & Properties",
          raw_transcription: "Acid catalyzed dehydration of alcohols with concentrated H2SO4 forms Alkenes with elimination of water molecule (beta-elimination). Addition reactions include catalytic hydrogenation across double bonds with Ni catalyst and Bromine test for unsaturation (discharge of reddish-orange color).",
          key_takeaways: [
            "Alkenes contain carbon-carbon double bonds characterized by reactive pi-electron density.",
            "Acid-catalyzed dehydration removes water to form alkenes through beta-elimination.",
            "Bromine testing provides rapid qualitative detection of pi bond unsaturation."
          ],
          worldTheme: "cyber_chemistry_sanctum",
          zones: [
            { id: "zone_synthesis", name: "Synthesis Reactor", description: "Where alcohols undergo acid-catalyzed dehydration" },
            { id: "zone_reactions", name: "Reaction Chamber", description: "Addition and hydrogenation catalyst bays" },
            { id: "zone_testing", name: "Testing Outpost", description: "Bromine unsaturation diagnostic lab" }
          ],
          nodes: [
            {
              node_id: "acidic_dehydration",
              title: "Acidic Dehydration of Alcohols",
              explanation: "Heating alcohols with concentrated H2SO4 eliminates a water molecule to form alkenes via carbocation intermediate.",
              importance: "primary",
              suggested_cluster: "Synthesis",
              recallPrompt: "What reagent is required to dehydrate ethanol to ethene?"
            },
            {
              node_id: "beta_elimination",
              title: "Beta-Elimination Reaction",
              explanation: "Mechanistic reaction removing atoms from adjacent carbon centers to yield a stable pi double bond.",
              importance: "secondary",
              suggested_cluster: "Mechanisms",
              recallPrompt: "Which carbon loses the hydrogen in a beta-elimination?"
            },
            {
              node_id: "addition_reactions",
              title: "Addition Reactions of Alkenes",
              explanation: "Characteristic electrophilic additions across carbon-carbon double bonds breaking the pi bond.",
              importance: "primary",
              suggested_cluster: "Properties",
              recallPrompt: "Why are alkenes susceptible to electrophilic attack?"
            },
            {
              node_id: "hydrogenation",
              title: "Catalytic Hydrogenation",
              explanation: "Addition of H2 across an alkene using Nickel or Palladium catalyst at elevated temperatures to yield alkanes.",
              importance: "secondary",
              suggested_cluster: "Reactions",
              recallPrompt: "What catalyst is traditionally used for Sabatier-Senderens reaction?"
            },
            {
              node_id: "test_for_unsaturation",
              title: "Bromine Test for Unsaturation",
              explanation: "Rapid discharge of reddish-orange Br2 in CCl4 solvent confirms presence of double or triple carbon bonds.",
              importance: "tertiary",
              suggested_cluster: "Qualitative Tests",
              recallPrompt: "What color change indicates a positive test with bromine water?"
            }
          ],
          edges: [
            { source_id: "acidic_dehydration", target_id: "beta_elimination", relationship_type: "is an example of" },
            { source_id: "addition_reactions", target_id: "hydrogenation", relationship_type: "includes" },
            { source_id: "addition_reactions", target_id: "test_for_unsaturation", relationship_type: "demonstrated by" }
          ],
          questions: [
            {
              question_id: "q1",
              linked_node_id: "test_for_unsaturation",
              question_text: "What visual change signifies a positive test for unsaturation using Br2 in CCl4?",
              options: [
                { id: "A", text: "Formation of a dense white precipitate" },
                { id: "B", text: "Discharge of the reddish-orange color" },
                { id: "C", text: "Rapid evolution of hydrogen gas" },
                { id: "D", text: "Turns deep violet under heat" }
              ],
              correct_option_id: "B",
              explanation: "Bromine rapidly adds across unsaturated pi-bonds, discharging its signature reddish-orange hue."
            },
            {
              question_id: "q2",
              linked_node_id: "acidic_dehydration",
              question_text: "In acid-catalyzed dehydration of alcohols, what small molecule is eliminated?",
              options: [
                { id: "A", text: "Water (H2O)" },
                { id: "B", text: "Carbon Dioxide (CO2)" },
                { id: "C", text: "Ammonia (NH3)" },
                { id: "D", text: "Hydrogen Gas (H2)" }
              ],
              correct_option_id: "A",
              explanation: "Dehydration involves the removal of -H and -OH from adjacent carbons, forming water (H2O)."
            }
          ]
        };
      } else {
        throw new Error('The AI service did not return any concepts for this document.');
      }
    }

    let structuredResult = null;

    if (normalizedMode === 'explanation') {
      // 2D EXPLANATION DOSSIER
      const derivedTakeaways = (rawGraph.key_takeaways && rawGraph.key_takeaways.length > 0)
        ? rawGraph.key_takeaways
        : (rawGraph.nodes || []).slice(0, 4).map((n) => `${n.title}: ${n.explanation}`);

      structuredResult = {
        title: rawGraph.subject_title || docTitle,
        summary: rawGraph.raw_transcription || `Syntropy AI extracted ${rawGraph.nodes?.length || 0} core concepts from the uploaded document.`,
        concepts: (rawGraph.nodes || []).map((n) => {
          const linkedQ = (rawGraph.questions || []).find((q) => q.linked_node_id === n.node_id);
          return {
            id: n.node_id,
            name: n.title,
            definition: n.explanation,
            importance: n.importance || 'primary',
            cluster: n.suggested_cluster || 'Core Topics',
            recall_prompt: n.recallPrompt || linkedQ?.question_text || `Explain the key role and mechanism of ${n.title}.`
          };
        }),
        relationships: (rawGraph.edges || []).map((e) => ({
          from: e.source_id,
          to: e.target_id,
          type: e.relationship_type
        })),
        key_takeaways: derivedTakeaways,
        questions: rawGraph.questions || [],
        nodes: rawGraph.nodes || []
      };
    } else if (normalizedMode === 'world') {
      // 2D WORLD REALM
      const zones = rawGraph.zones && rawGraph.zones.length > 0 ? rawGraph.zones : [
        { id: "zone_alpha", name: "Primary Concept Chamber", description: "Foundational concepts and principles" },
        { id: "zone_beta", name: "Relational Matrix", description: "Interactive linkages and mechanisms" },
        { id: "zone_gamma", name: "Mastery Proving Ground", description: "Active recall challenges and evaluation" }
      ];

      structuredResult = {
        world: {
          id: `realm_${jobId}`,
          name: rawGraph.subject_title || docTitle,
          theme: rawGraph.worldTheme || "cyber_grid_matrix",
          background: "organic_grid_matrix"
        },
        zones,
        npcs: [
          { id: "npc_guide", name: "Syntropy Overseer", dialogue: `Welcome traveler. Master the concepts of ${rawGraph.subject_title || docTitle} to conquer this realm!` }
        ],
        quests: (rawGraph.nodes || []).map((n, idx) => {
          const linkedQ = (rawGraph.questions || []).find((q) => q.linked_node_id === n.node_id);
          return {
            quest_id: `quest_${idx + 1}`,
            title: `Master ${n.title}`,
            description: n.explanation,
            reward_xp: 50,
            target_node: n.node_id,
            linked_question: linkedQ || null
          };
        }),
        questions: rawGraph.questions || [],
        nodes: rawGraph.nodes || []
      };
    } else {
      // GRAPH STRUCTURE (Default)
      structuredResult = {
        ...rawGraph,
        title: rawGraph.subject_title || docTitle,
        summary: rawGraph.raw_transcription,
        nodes: rawGraph.nodes || [],
        edges: rawGraph.edges || [],
        questions: rawGraph.questions || []
      };
    }

    // Save result to generation_results
    const resultId = `res_${uuidv4().substring(0, 12)}`;
    db.prepare(
      `INSERT INTO generation_results (id, job_id, document_id, mode, result_json) VALUES (?, ?, ?, ?, ?)`
    ).run(resultId, jobId, document_id, normalizedMode, JSON.stringify(structuredResult));

    // Update job status to completed
    db.prepare(
      `UPDATE generation_jobs SET status = 'completed', completed_at = datetime('now') WHERE id = ?`
    ).run(jobId);

    recordActivity(req.user.id);

    return res.status(200).json({
      success: true,
      job_id: jobId,
      document_id,
      mode: normalizedMode,
      status: 'completed',
      result: structuredResult
    });
  } catch (err) {
    console.error('[ingestionController] generateKnowledge error:', err);
    if (jobId) {
      try {
        db.prepare(
          `UPDATE generation_jobs SET status = 'failed', error = ?, completed_at = datetime('now') WHERE id = ?`
        ).run(err.message || 'AI generation failed.', jobId);
      } catch (statusErr) {
        console.error('[ingestionController] failed to update job status:', statusErr.message);
      }
    }
    return res.status(502).json({
      success: false,
      error: err.message || 'Failed to generate knowledge structure.'
    });
  }
}

/**
 * GET /api/generation/:jobId
 */
function getGenerationJob(req, res) {
  try {
    const { jobId } = req.params;
    const job = db.prepare(`SELECT * FROM generation_jobs WHERE id = ? AND user_id = ?`)
      .get(jobId, req.user.id);

    if (!job) {
      return res.status(404).json({ success: false, error: 'Generation job not found.' });
    }

    if (job.status === 'completed') {
      const resultRow = db.prepare(`SELECT result_json FROM generation_results WHERE job_id = ?`).get(jobId);
      return res.status(200).json({
        success: true,
        job_id: job.id,
        document_id: job.document_id,
        mode: job.mode,
        status: 'completed',
        result: resultRow ? JSON.parse(resultRow.result_json) : null
      });
    }

    return res.status(200).json({
      success: true,
      job_id: job.id,
      document_id: job.document_id,
      mode: job.mode,
      status: job.status,
      error: job.error
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * GET /api/document/:documentId
 */
function getDocument(req, res) {
  try {
    const { documentId } = req.params;
    const doc = db.prepare(`SELECT * FROM documents WHERE id = ? AND user_id = ?`)
      .get(documentId, req.user.id);

    if (!doc) {
      return res.status(404).json({ success: false, error: 'Document not found.' });
    }

    return res.status(200).json({ success: true, document: doc });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = {
  uploadDocument,
  generateKnowledge,
  getGenerationJob,
  getDocument
};
