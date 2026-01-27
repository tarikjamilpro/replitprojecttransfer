import { SEO } from "@/components/SEO";
import { SITE_NAME, SITE_URL, SUPPORT_EMAIL } from "@/lib/constants";

export default function TermsOfUse() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SEO 
        title={`Terms of Use - ${SITE_NAME}`} 
        description={`Terms of Use for ${SITE_NAME}. Read our terms and conditions for using our free online tools.`} 
      />
      
      <h1 className="text-3xl font-bold text-foreground mb-8" data-testid="text-page-title">
        Terms of Use
      </h1>
      
      <div className="prose prose-sm max-w-none text-muted-foreground space-y-6">
        <p className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Agreement to Terms</h2>
          <p>
            By accessing and using {SITE_NAME} ({SITE_URL}), you agree to be bound by these Terms of Use. If you do not agree with any part of these terms, you must not use this website.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Acceptable Use</h2>
          <p>
            You agree to use {SITE_NAME} only for lawful purposes and in a way that does not infringe the rights of, restrict, or inhibit anyone else's use of the website. Specifically, you agree NOT to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Use automated tools, bots, scrapers, or similar technologies to access, extract, or download content from the website without prior written consent</li>
            <li>Attempt to gain unauthorized access to our systems or servers</li>
            <li>Interfere with or disrupt the website or servers or networks connected to the website</li>
            <li>Upload or transmit viruses, malware, or any other harmful code</li>
            <li>Use the website for any illegal or unauthorized purpose</li>
            <li>Violate any applicable laws or regulations</li>
            <li>Impersonate any person or entity, or falsely state or misrepresent your affiliation with a person or entity</li>
            <li>Attempt to reverse engineer, decompile, or disassemble any software used on the website</li>
            <li>Use the website in any manner that could damage, disable, overburden, or impair it</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Intellectual Property</h2>
          <p>
            The content, design, graphics, and other materials on {SITE_NAME} are protected by copyright and other intellectual property laws. You may not reproduce, distribute, modify, or create derivative works from any content on this website without our express written permission.
          </p>
          <p>
            You may use our tools for personal or commercial purposes, but you may not claim ownership of our tools or rebrand them as your own without permission.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">User Content</h2>
          <p>
            When you use our tools, you retain full ownership of any content you input. Since our tools process data client-side (in your browser), your input data is not stored on our servers. You are solely responsible for ensuring that any content you process through our tools does not violate any third-party rights.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Service Availability</h2>
          <p>
            We strive to keep {SITE_NAME} available 24/7, but we do not guarantee uninterrupted access to the website. We reserve the right to modify, suspend, or discontinue any part of the website at any time without notice.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Third-Party Links</h2>
          <p>
            Our website may contain links to third-party websites. These links are provided for your convenience only. We do not endorse or assume any responsibility for the content or practices of linked websites.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, {SITE_NAME} shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of the website or tools.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Governing Law</h2>
          <p>
            These Terms of Use shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms of Use at any time. Changes will be effective immediately upon posting to the website. Your continued use of the website after any changes constitutes acceptance of the new Terms of Use.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Contact Us</h2>
          <p>
            If you have any questions about these Terms of Use, please contact us at{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary hover:underline">
              {SUPPORT_EMAIL}
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
