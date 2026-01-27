import { SEO } from "@/components/SEO";
import { SITE_NAME, SUPPORT_EMAIL } from "@/lib/constants";

export default function Disclaimer() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SEO 
        title={`Disclaimer - ${SITE_NAME}`} 
        description={`Disclaimer for ${SITE_NAME}. Understand the limitations and terms of using our free online tools.`} 
      />
      
      <h1 className="text-3xl font-bold text-foreground mb-8" data-testid="text-page-title">
        Disclaimer
      </h1>
      
      <div className="prose prose-sm max-w-none text-muted-foreground space-y-6">
        <p className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">General Disclaimer</h2>
          <p>
            The information and tools provided on {SITE_NAME} are for general informational purposes only. All tools and content on this website are provided <strong>"as is"</strong> without any warranties of any kind, either express or implied, including but not limited to the implied warranties of merchantability, fitness for a particular purpose, or non-infringement.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Accuracy of Information</h2>
          <p>
            While we strive to provide accurate and up-to-date tools and information, {SITE_NAME} makes no representations or warranties of any kind about the completeness, accuracy, reliability, suitability, or availability of the tools, information, or related graphics contained on the website.
          </p>
          <p>
            <strong>We do not guarantee 100% accuracy</strong> of any SEO data, calculations, conversions, or other results produced by our tools. Users should independently verify all results and not rely solely on the output from our tools for critical decisions.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Limitation of Liability</h2>
          <p>
            In no event shall {SITE_NAME}, its owners, operators, affiliates, or partners be liable for any direct, indirect, incidental, special, consequential, or punitive damages, including but not limited to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Loss of profits, revenue, data, or use</li>
            <li>Business interruption</li>
            <li>Personal injury or property damage</li>
            <li>Any other losses arising out of or in connection with your use of or inability to use our website or tools</li>
          </ul>
          <p>
            This limitation of liability applies regardless of whether the alleged liability is based on contract, tort, negligence, strict liability, or any other legal theory.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Third-Party Links</h2>
          <p>
            Our website may contain links to third-party websites or services that are not owned or controlled by {SITE_NAME}. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Professional Advice</h2>
          <p>
            The tools and information provided on {SITE_NAME} are not intended to be a substitute for professional advice. For specific legal, financial, medical, or other professional advice, please consult with a qualified professional.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Indemnification</h2>
          <p>
            You agree to defend, indemnify, and hold harmless {SITE_NAME} and its owners, operators, and affiliates from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees arising out of or relating to your use of our website or tools.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Changes to This Disclaimer</h2>
          <p>
            We reserve the right to modify or replace this Disclaimer at any time. Your continued use of the website after any changes constitutes acceptance of the new Disclaimer.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Contact Us</h2>
          <p>
            If you have any questions about this Disclaimer, please contact us at{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary hover:underline">
              {SUPPORT_EMAIL}
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
