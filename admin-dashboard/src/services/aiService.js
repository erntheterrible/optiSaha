import axios from 'axios';

/**
 * Client wrapper that calls the backend AI proxy.
 * Assumes a serverless /api/ai-meeting-prep endpoint exists.
 */
const aiService = {
  _endpoint() {
    const isLocalhost = typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost';
    // When running locally with Netlify CLI (`netlify dev`) functions are served from /.netlify/functions/
    return isLocalhost ? '/.netlify/functions/ai-meeting-prep' : '/api/ai-meeting-prep';
  },
  /**
   * Generate meeting briefing using event + customer context.
   * @param {object} eventData
   * @param {object|null} customerData
   * @returns {Promise<{summary: string}>}
   */
  async generateMeetingBriefing(eventData, customerData) {
    try {
      const { data } = await axios.post(this._endpoint(), {
        event: eventData,
        customerData: customerData || null,
      });
      return data;
    } catch (err) {
      console.error('generateMeetingBriefing error:', err);
      throw err;
    }
  },
};

export default aiService;
