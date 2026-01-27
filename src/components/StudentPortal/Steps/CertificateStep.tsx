import { WizardStepProps } from "../CandidateWizard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Award, Download, Share2, CheckCircle2, Calendar, User, FileText } from "lucide-react";

export function CertificateStep({ }: WizardStepProps) {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Success Banner */}
      <div className="bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 border border-green-500/30 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="alumni-sans-title text-4xl text-foreground mb-2">
          Congratulations! 🎉
        </h2>
        <p className="text-lg text-muted-foreground mb-4">
          You have successfully completed your certification exam
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30">
          <Award className="w-4 h-4 text-green-600 dark:text-green-400" />
          <span className="text-sm font-bold text-green-700 dark:text-green-400">Score: 85% - PASSED</span>
        </div>
      </div>

      {/* Certificate Card */}
      <Card className="border-border/40 shadow-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-b border-border/40 p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Award className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="alumni-sans-title text-3xl text-foreground">
                  Official Certificate
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Government Certification Program
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-8">
          {/* Certificate Preview */}
          <div className="border-4 border-primary/20 rounded-2xl p-12 bg-gradient-to-br from-card via-background to-card relative overflow-hidden mb-8">
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-full -translate-x-16 -translate-y-16" />
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-primary/5 rounded-full translate-x-20 translate-y-20" />
            
            <div className="relative z-10 text-center space-y-6">
              <div className="inline-block">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Award className="w-10 h-10 text-primary" />
                </div>
              </div>
              
              <div>
                <p className="text-sm uppercase tracking-widest text-muted-foreground font-bold mb-2">
                  Certificate of Achievement
                </p>
                <h4 className="alumni-sans-title text-4xl text-foreground mb-4">
                  Professional Certification
                </h4>
                <p className="text-muted-foreground mb-6">
                  This is to certify that
                </p>
                <p className="font-display font-bold text-2xl text-primary mb-6">
                  Muhammad Ahmed
                </p>
                <p className="text-muted-foreground mb-8">
                  has successfully completed the Government Certification Program<br />
                  and demonstrated proficiency in all required competencies
                </p>
              </div>

              {/* Certificate Details */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border/40">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Certificate Number</p>
                  <p className="font-mono font-bold text-sm">CP-2024-88A21</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Issue Date</p>
                  <p className="font-bold text-sm">January 20, 2026</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Score</p>
                  <p className="font-bold text-sm text-green-600 dark:text-green-400">85%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Certificate Information */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/20 border border-border/40">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground mb-1">Candidate Name</p>
                <p className="text-sm text-muted-foreground">Muhammad Ahmed</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/20 border border-border/40">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground mb-1">Certificate Number</p>
                <p className="text-sm text-muted-foreground font-mono">CP-2024-88A21</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/20 border border-border/40">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground mb-1">Issue Date</p>
                <p className="text-sm text-muted-foreground">January 20, 2026</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/20 border border-border/40">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground mb-1">Status</p>
                <div className="inline-flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">Verified & Active</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <Button size="lg" className="flex-1 gap-2 shadow-lg">
              <Download className="w-4 h-4" />
              Download Certificate (PDF)
            </Button>
            <Button variant="outline" size="lg" className="gap-2">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Important Notice */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
        <h4 className="font-bold text-foreground mb-2 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Important Information
        </h4>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li>• Your certificate is now available for download and is officially registered in the national database</li>
          <li>• Certificate verification can be done online using the certificate number</li>
          <li>• Keep your certificate number safe for future reference and verification purposes</li>
          <li>• This certificate is valid for 3 years from the date of issue</li>
        </ul>
      </div>
    </div>
  );
}
