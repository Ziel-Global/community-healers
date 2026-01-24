import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Mail, Phone, MapPin, CreditCard, Calendar, Award, CheckCircle2, Clock, Download, Share2 } from "lucide-react";

interface ProfileViewProps {
  examCompleted?: boolean;
  examScore?: number;
  certificateNumber?: string;
}

export function ProfileView({ examCompleted = false, examScore, certificateNumber }: ProfileViewProps) {
  return (
    <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
      {/* Profile Header */}
      <Card className="border-border/40 shadow-sm">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border-2 border-primary/20 flex-shrink-0">
              <User className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
            </div>
            <div className="flex-1 text-center sm:text-left w-full">
              <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-2 mb-2">
                <div>
                  <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground">Muhammad Ahmed</h2>
                  <p className="text-sm text-muted-foreground">Candidate ID: CA-2026-001234</p>
                </div>
                <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mt-4">
                <div className="flex items-center justify-center sm:justify-start gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-foreground truncate">ahmed@example.com</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-foreground">03001234567</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-foreground">Lahore, Pakistan</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card className="border-border/40 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Full Name</p>
              <p className="font-semibold text-foreground">Muhammad Ahmed</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Father's Name</p>
              <p className="font-semibold text-foreground">Aslam Khan</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">CNIC Number</p>
              <p className="font-semibold text-foreground font-mono">42201-1234567-1</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Date of Birth</p>
              <p className="font-semibold text-foreground">January 15, 1998</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">City</p>
              <p className="font-semibold text-foreground">Lahore</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Registration Date</p>
              <p className="font-semibold text-foreground">January 10, 2026</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Application Status */}
      <Card className="border-border/40 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Application Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                <p className="font-semibold text-foreground">Registration</p>
              </div>
              <p className="text-xs text-muted-foreground">Completed & Verified</p>
            </div>
            <div className={`p-4 rounded-xl ${examCompleted ? 'bg-green-500/10 border-green-500/30' : 'bg-blue-500/10 border-blue-500/30'}`}>
              <div className="flex items-center gap-2 mb-2">
                {examCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : (
                  <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                )}
                <p className="font-semibold text-foreground">Exam Status</p>
              </div>
              <p className="text-xs text-muted-foreground">
                {examCompleted ? `Passed - Score: ${examScore}%` : 'Scheduled - Jan 25, 2026'}
              </p>
            </div>
            <div className={`p-4 rounded-xl ${examCompleted ? 'bg-green-500/10 border-green-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Award className={`w-5 h-5 ${examCompleted ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`} />
                <p className="font-semibold text-foreground">Certificate</p>
              </div>
              <p className="text-xs text-muted-foreground">
                {examCompleted ? 'Issued & Available' : 'Pending Exam'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Certificate Download Section - Only show if exam completed */}
      {examCompleted && certificateNumber && (
        <Card className="border-primary/30 shadow-lg bg-gradient-to-br from-green-500/5 to-emerald-500/5">
          <CardHeader className="border-b border-border/40 bg-gradient-to-r from-primary/5 to-primary/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Your Certificate is Ready!</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Congratulations on passing your certification exam
                  </p>
                </div>
              </div>
              <Badge className="bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/40 text-sm px-3 py-1">
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Certified
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="p-4 rounded-xl bg-card border border-border/40">
                <p className="text-xs text-muted-foreground mb-1">Certificate Number</p>
                <p className="font-bold text-foreground font-mono text-lg">{certificateNumber}</p>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border/40">
                <p className="text-xs text-muted-foreground mb-1">Exam Score</p>
                <p className="font-bold text-green-600 dark:text-green-400 text-lg">{examScore}% - PASSED</p>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border/40">
                <p className="text-xs text-muted-foreground mb-1">Issue Date</p>
                <p className="font-bold text-foreground">January 21, 2026</p>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border/40">
                <p className="text-xs text-muted-foreground mb-1">Valid Until</p>
                <p className="font-bold text-foreground">January 21, 2029</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="flex-1 gap-2 shadow-lg">
                <Download className="w-4 h-4" />
                Download Certificate (PDF)
              </Button>
              <Button variant="outline" size="lg" className="gap-2">
                <Share2 className="w-4 h-4" />
                Share Certificate
              </Button>
            </div>

            <div className="mt-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">Note:</strong> Your certificate is registered in the national database and can be verified online using the certificate number.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documents */}
      <Card className="border-border/40 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Uploaded Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: "CNIC Front", status: "Verified" },
              { name: "CNIC Back", status: "Verified" },
              { name: "Educational Certificate", status: "Verified" },
              { name: "Passport Size Photo", status: "Verified" },
            ].map((doc, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 border border-border/40"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">Uploaded on Jan 10, 2026</p>
                  </div>
                </div>
                <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  {doc.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
