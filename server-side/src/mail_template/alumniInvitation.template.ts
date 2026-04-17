export const ALUMNI_INVITATION_SUBJECT =
  "CCS Git-Together Invitation for UC Alumni";

export const ALUMNI_REGISTRATION_LINK =
  "https://docs.google.com/forms/d/e/1FAIpQLSerzkPmuOyNkOz-O-O8PsLhHjtNqUzjahXpPrCq0ga5nYJEeQ/formResponse";

export const buildAlumniInvitationHtml = (): string => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${ALUMNI_INVITATION_SUBJECT}</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #eef4ff; font-family: Arial, Helvetica, sans-serif; color: #0f172a;">
    <div style="margin: 0; padding: 32px 16px; background: linear-gradient(180deg, #dbeafe 0%, #eef4ff 100%);">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 680px; margin: 0 auto;">
        <tr>
          <td>
            <div style="background-color: #0f3d91; border-radius: 24px 24px 0 0; padding: 32px 40px; text-align: center;">
              <div style="display: inline-block; background-color: rgba(255, 255, 255, 0.16); color: #dbeafe; border: 1px solid rgba(255, 255, 255, 0.22); border-radius: 999px; font-size: 12px; letter-spacing: 1.2px; text-transform: uppercase; padding: 8px 14px;">
                University of Cebu - Main Campus
              </div>
              <h1 style="margin: 18px 0 8px; color: #ffffff; font-size: 32px; line-height: 1.2;">
                CCS Git-Together
              </h1>
              <p style="margin: 0; color: #dbeafe; font-size: 16px; line-height: 1.6;">
                A homecoming for the PSITS UC-Main alumni community
              </p>
            </div>

            <div style="background-color: #ffffff; border: 1px solid #bfdbfe; border-top: 0; border-radius: 0 0 24px 24px; padding: 40px;">
              <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.8;">Dear Alumni,</p>

              <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.8;">
                It's time to come home! We are thrilled to invite you to the CCS Git-Together.
                This is a special opportunity to reconnect with old friends, share your
                professional journeys, and celebrate the lasting legacy of our IT community at
                the University of Cebu.
              </p>

              <p style="margin: 0 0 28px; font-size: 16px; line-height: 1.8;">
                Whether it has been a few years or a decade since you graduated, your presence
                will make this gathering truly memorable.
              </p>

              <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border: 1px solid #bfdbfe; border-radius: 20px; padding: 24px; margin-bottom: 28px;">
                <h2 style="margin: 0 0 16px; color: #0f3d91; font-size: 20px;">Event Details</h2>
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td style="padding: 8px 0; font-size: 15px; line-height: 1.7; color: #1e3a8a; width: 140px;"><strong>Date</strong></td>
                    <td style="padding: 8px 0; font-size: 15px; line-height: 1.7;">March 28, 2026</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-size: 15px; line-height: 1.7; color: #1e3a8a;"><strong>Venue</strong></td>
                    <td style="padding: 8px 0; font-size: 15px; line-height: 1.7;">The Tent, Mandani Bay</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-size: 15px; line-height: 1.7; color: #1e3a8a;"><strong>Call Time</strong></td>
                    <td style="padding: 8px 0; font-size: 15px; line-height: 1.7;">1:00 PM</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-size: 15px; line-height: 1.7; color: #1e3a8a;"><strong>Theme</strong></td>
                    <td style="padding: 8px 0; font-size: 15px; line-height: 1.7;">Black and White</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-size: 15px; line-height: 1.7; color: #1e3a8a;"><strong>Registration Fee</strong></td>
                    <td style="padding: 8px 0; font-size: 15px; line-height: 1.7;">PHP 1,000</td>
                  </tr>
                </table>
              </div>

              <div style="margin-bottom: 28px;">
                <h2 style="margin: 0 0 14px; color: #0f3d91; font-size: 20px;">How to Register</h2>
                <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.8;">
                  To secure your spot, please complete the registration and payment process via
                  the link below. The fee covers the event program and dinner.
                </p>
                <div style="text-align: center; margin: 24px 0;">
                  <a
                    href="${ALUMNI_REGISTRATION_LINK}"
                    style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; padding: 14px 26px; border-radius: 999px;"
                  >
                    Complete Registration
                  </a>
                </div>
                <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.8;">
                  <strong>Registration Link:</strong>
                  <a href="${ALUMNI_REGISTRATION_LINK}" style="color: #2563eb; word-break: break-word;">
                    ${ALUMNI_REGISTRATION_LINK}
                  </a>
                </p>
                <p style="margin: 0; font-size: 16px; line-height: 1.8;">
                  <strong>Payment:</strong> You will find the GCash QR Code directly within the
                  form. Please upload your proof of payment to the form to finalize your slot.
                </p>
              </div>

              <div style="background-color: #f8fbff; border-left: 4px solid #2563eb; border-radius: 14px; padding: 20px 22px; margin-bottom: 28px;">
                <p style="margin: 0; font-size: 16px; line-height: 1.8;">
                  We are excited to hear about your milestones and to bridge the gap between our
                  distinguished alumni and the next generation of IT leaders. Let's make this a
                  day of networking, nostalgia, and great company in our classic black and white
                  style.
                </p>
              </div>

              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.8;">
                We look forward to seeing you at Mandani Bay!
              </p>

              <p style="margin: 0; font-size: 16px; line-height: 1.8;">
                Warm regards,
              </p>
              <p style="margin: 8px 0 0; font-size: 16px; line-height: 1.8;">
                <strong>PSITS UC-Main Chapter</strong><br />
                University of Cebu - Main Campus
              </p>
            </div>
          </td>
        </tr>
      </table>
    </div>
  </body>
</html>
`;

