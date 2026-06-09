function recordRoutingTrace(session, trace) {
  if (!Array.isArray(session.routing_trace)) session.routing_trace = [];
  const routingTraceId = `rt-${String(session.routing_trace.length + 1).padStart(3, "0")}`;
  const entry = {
    routing_trace_id: routingTraceId,
    from_question_id: trace.from_question_id,
    selected_option_ids: trace.selected_option_ids,
    effects: trace.effects,
    ai_status: trace.ai_status,
    ai_query: trace.ai_query || null,
    ai_candidate_question_ids: trace.ai_candidate_question_ids,
    safe_candidate_question_ids: trace.safe_candidate_question_ids,
    selected_next_question_id: trace.selected_next_question_id,
    reason_codes: trace.reason_codes
  };
  session.routing_trace.push(entry);
  return entry;
}

module.exports = {
  recordRoutingTrace
};
