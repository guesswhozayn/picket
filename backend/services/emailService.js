const fs = require('fs');
const path = require('path');

function sendAssessmentEmail(candidate, assessmentLink) {
  const emailContent = `
========================================================================
EMAIL OUTBOX (SIMULATED)
To: ${candidate.email}
Subject: Technical Assessment Invitation - Picket
------------------------------------------------------------------------
Hello ${candidate.name},

Thank you for your application. We are pleased to invite you to the next 
stage of our recruiting process. 

Please complete a brief 5-minute interactive logic challenge to verify 
your application profile:

Assessment Link: ${assessmentLink}

Note: You do not need to register or log in. The link is unique to you.
========================================================================
`;

  console.log(emailContent);

  try {
    const logPath = path.join(__dirname, '../emails_sent.log');
    fs.appendFileSync(logPath, `${new Date().toISOString()}\n${emailContent}\n\n`);
  } catch (err) {
    console.error('Failed to write email log:', err.message);
  }
}

module.exports = { sendAssessmentEmail };
