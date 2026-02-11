import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { User, Mail, Phone, MapPin, FileText, Calendar, Award, CheckCircle2, Clock, Download, Share2, Eye, AlertCircle, X } from "lucide-react";
import { format } from "date-fns";
import { api } from "@/services/api";

interface UploadedDocument {
  id: string;
  name: string;
  type: string;
  isMandatory: boolean;
  status: "pending" | "uploading" | "complete" | "error";
  fileName?: string;
  fileData?: string;
  fileType?: string;
}

interface CandidateData {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    role: string;
    status: string;
  };
  userId: string;
  cnic: string;
  fatherName: string;
  dob: string;
  city: {
    id: string;
    name: string;
  };
  address: string;
  has16YearsEducation: boolean;
  certificateIssued: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProfileViewProps {
  isRegistrationComplete?: boolean;
  scheduledExamDate?: Date;
  examCompleted?: boolean;
  examScore?: number;
  certificateNumber?: string;
}

export function ProfileView({
  isRegistrationComplete = false,
  scheduledExamDate,
  examCompleted = false,
  examScore,
  certificateNumber
}: ProfileViewProps) {
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [previewDoc, setPreviewDoc] = useState<UploadedDocument | null>(null);
  const [candidateData, setCandidateData] = useState<CandidateData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch candidate data from API
  useEffect(() => {
    const fetchCandidateData = async () => {
      try {
        const response = await api.get('/candidates/me');
        const data = response.data.data;
        setCandidateData(data);

        // Map API documents to UploadedDocument interface
        if (data.documents && Array.isArray(data.documents)) {
          const apiDocs: UploadedDocument[] = [];

          // Define expected document types to ensure we display all required slots even if not uploaded
          const expectedDocs = [
            { id: "photo", name: "Candidate Photo", isMandatory: true },
            { id: "cnicFront", name: "CNIC Front", isMandatory: true },
            { id: "cnicBack", name: "CNIC Back", isMandatory: true },
            { id: "policeClearance", name: "Police Clearance Certificate", isMandatory: true },
            { id: "medicalCertificate", name: "Medical Certificate", isMandatory: true },
            { id: "passport", name: "Passport", isMandatory: false },
            { id: "degreeTranscript", name: "Degree/Transcript", isMandatory: false },
          ];

          expectedDocs.forEach(expected => {
            const found = data.documents.find((d: any) => d.type === expected.id);
            if (found) {
              // CRITICAL FIX: Only consider it complete if fileUrl is present
              const isComplete = !!found.fileUrl;

              apiDocs.push({
                id: found.id || expected.id,
                name: expected.name,
                type: found.type,
                isMandatory: expected.isMandatory && !isComplete, // If not complete, it remains mandatory pending
                status: isComplete ? "complete" : "pending",
                fileName: found.fileUrl ? found.fileUrl.split('/').pop() : undefined,
                fileData: found.fileUrl,
                fileType: found.fileUrl?.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'
              });
            } else {
              apiDocs.push({
                id: expected.id,
                name: expected.name,
                type: "PDF/Image",
                isMandatory: expected.isMandatory,
                status: "pending"
              });
            }
          });

          setUploadedDocuments(apiDocs);
        }

      } catch (error) {
        console.error('Failed to fetch candidate data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidateData();
  }, []);

  const completedDocs = uploadedDocuments.filter(doc => doc.status === "complete");
  const pendingDocs = uploadedDocuments.filter(doc => doc.status === "pending" && doc.isMandatory);

  const handleViewDocument = (doc: UploadedDocument) => {
    if (doc.fileData) { // fileData now holds the URL
      // Open PDFs in a new tab
      if (isPdfFile(doc.fileType || (doc.fileData.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'))) {
        window.open(doc.fileData, '_blank');
      } else {
        // Show images in modal
        setPreviewDoc(doc);
      }
    }
  };

  const isImageFile = (fileType?: string) => {
    return fileType?.startsWith('image/') || false;
  };

  const isPdfFile = (fileType?: string) => {
    return fileType === 'application/pdf';
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
        <Card className="border-border/40 shadow-sm">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Loading profile...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                  <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground">
                    {candidateData ? `${candidateData.user.firstName} ${candidateData.user.lastName}` : 'N/A'}
                  </h2>
                  <p className="text-sm text-muted-foreground">Candidate ID: {candidateData?.userId || 'N/A'}</p>
                </div>
                <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  {candidateData?.user.status || 'Active'}
                </Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mt-4">
                <div className="flex items-center justify-center sm:justify-start gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-foreground truncate">{candidateData?.user.email || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-foreground">{candidateData?.user.phoneNumber || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-foreground">{candidateData?.city?.name || 'N/A'}, Pakistan</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scheduled Exam Card - Only show if registration complete and exam scheduled */}
      {isRegistrationComplete && scheduledExamDate && !examCompleted && (
        <Card className="border-primary/30 shadow-lg bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl alumni-sans-title">Exam Scheduled</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Your examination has been scheduled
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-card border border-border/40">
                <p className="text-xs text-muted-foreground mb-1">Date</p>
                <p className="font-bold text-foreground">{format(scheduledExamDate, 'MMMM d, yyyy')}</p>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border/40">
                <p className="text-xs text-muted-foreground mb-1">Time</p>
                <p className="font-bold text-foreground">10:00 AM</p>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border/40">
                <p className="text-xs text-muted-foreground mb-1">Center</p>
                <p className="font-bold text-foreground">LHR-003</p>
              </div>
            </div>
            <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">Note:</strong> Please visit your assigned center on the scheduled date. The center admin will initiate your exam.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Personal Information */}
      <Card className="border-border/40 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 alumni-sans-title">
            <User className="w-5 h-5 text-primary" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Father's Name</p>
              <p className="font-semibold text-foreground">{candidateData?.fatherName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">CNIC Number</p>
              <p className="font-semibold text-foreground font-mono">{candidateData?.cnic || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Date of Birth</p>
              <p className="font-semibold text-foreground">
                {candidateData?.dob ? format(new Date(candidateData.dob), 'MMMM dd, yyyy') : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">City</p>
              <p className="font-semibold text-foreground">{candidateData?.city?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Address</p>
              <p className="font-semibold text-foreground">{candidateData?.address || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Registration Date</p>
              <p className="font-semibold text-foreground">
                {candidateData?.createdAt ? format(new Date(candidateData.createdAt), 'MMMM dd, yyyy') : 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Application Status */}
      <Card className="border-border/40 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 alumni-sans-title">
            <Award className="w-5 h-5 text-primary" />
            Application Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-xl ${isRegistrationComplete ? 'bg-green-500/10 border-green-500/30' : 'bg-blue-500/10 border-blue-500/30'}`}>
              <div className="flex items-center gap-2 mb-2">
                {isRegistrationComplete ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : (
                  <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                )}
                <p className="font-semibold text-foreground">Registration</p>
              </div>
              <p className="text-xs text-muted-foreground">
                {isRegistrationComplete ? 'Completed & Verified' : 'In Progress'}
              </p>
            </div>
            <div className={`p-4 rounded-xl ${examCompleted ? 'bg-green-500/10 border-green-500/30' : isRegistrationComplete ? 'bg-blue-500/10 border-blue-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
              <div className="flex items-center gap-2 mb-2">
                {examCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : isRegistrationComplete ? (
                  <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                ) : (
                  <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                )}
                <p className="font-semibold text-foreground">Exam Status</p>
              </div>
              <p className="text-xs text-muted-foreground">
                {examCompleted
                  ? `Passed - Score: ${examScore}%`
                  : isRegistrationComplete && scheduledExamDate
                    ? `Scheduled - ${format(scheduledExamDate, 'MMM d, yyyy')}`
                    : 'Pending Registration'
                }
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
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 alumni-sans-title">
              <FileText className="w-5 h-5 text-primary" />
              Uploaded Documents
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              {completedDocs.length} of {uploadedDocuments.length} uploaded
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {uploadedDocuments.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No documents uploaded yet</p>
              <p className="text-xs text-muted-foreground mt-1">Complete your registration to upload documents</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Completed Documents */}
              {completedDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-green-500/5 border border-green-500/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{doc.name}</p>
                        {doc.isMandatory && (
                          <span className="text-[10px] font-bold text-primary uppercase">Required</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{doc.fileName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1 text-muted-foreground hover:text-foreground"
                      onClick={() => handleViewDocument(doc)}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">View</span>
                    </Button>
                    <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Uploaded
                    </Badge>
                  </div>
                </div>
              ))}

              {/* Pending Mandatory Documents */}
              {pendingDocs.length > 0 && (
                <>
                  <div className="pt-2 pb-1">
                    <p className="text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Missing Required Documents
                    </p>
                  </div>
                  {pendingDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-amber-500/5 border border-amber-500/20"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground">{doc.name}</p>
                            <span className="text-[10px] font-bold text-destructive uppercase">Required</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Format: {doc.type}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-amber-600 dark:text-amber-400 border-amber-500/30">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                      </Badge>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Preview Modal */}
      <Dialog open={!!previewDoc} onOpenChange={() => setPreviewDoc(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              {previewDoc?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 max-h-[70vh] overflow-auto rounded-lg border border-border/40 bg-muted/20">
            {previewDoc?.fileData && (
              <>
                {isImageFile(previewDoc.fileType) && (
                  <img
                    src={previewDoc.fileData}
                    alt={previewDoc.name}
                    className="w-full h-auto object-contain"
                  />
                )}
                {isPdfFile(previewDoc.fileType) && (
                  <div className="p-8 text-center">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      PDF opened in a new tab
                    </p>
                  </div>
                )}
                {!isImageFile(previewDoc.fileType) && !isPdfFile(previewDoc.fileType) && (
                  <div className="p-8 text-center">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Preview not available for this file type
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{previewDoc.fileName}</p>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setPreviewDoc(null)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
