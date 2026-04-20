// 📦 Purpose: Detects when a Wix contact is updated and triggers a webhook automation

import { contacts } from 'wix-crm-backend';
import { runContactUpdate } from 'backend/automations/run-contact-update.automation.jsw';

/**
 * Hook: Automatically called by Wix when a user updates their profile
 * (e.g., name, phone, or email change).
 *
 * @param {Object} event - The contact update event from Wix CRM
 */
export function contacts_onContactUpdated(event) {
  console.log("📍 Contact update hook triggered ✅"); // Debug log for confirmation

  const updatedContact = event.contact;

  // Log the contact payload (debugging purpose)
  console.log("🧾 Updated contact data:", updatedContact);

  // 🚀 Trigger the automation (which sends webhook to AWS)
  runContactUpdate(updatedContact);
}
