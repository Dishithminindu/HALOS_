/**
 * HALOS v2.0 - Audit Logging Engine
 * Records research access, CRUD events, and model inferences for reproducibility.
 */

export async function logAuditEvent(db, eventType, participantId = null, metadata = {}) {
  try {
    const id = `aud_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
    const now = new Date().toISOString();
    const metadataStr = JSON.stringify(metadata);

    await db.prepare(`
      INSERT INTO audit_events (id, event_type, participant_id, created_at, metadata_json)
      VALUES (?, ?, ?, ?, ?)
    `).bind(id, eventType, participantId, now, metadataStr).run();
  } catch (err) {
    console.error('[AUDIT_LOG_ERROR]', err);
  }
}
