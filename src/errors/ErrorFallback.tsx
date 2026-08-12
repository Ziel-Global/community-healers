import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export interface ErrorFallbackProps {
    error: unknown;
    resetErrorBoundary: (...args: unknown[]) => void;
    title?: string;
    description?: string;
    homePath?: string;
}

export function ErrorFallback({ error, resetErrorBoundary, title, description, homePath = "/" }: ErrorFallbackProps) {
    const message = error instanceof Error ? error.message : undefined;

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
            <Card className="w-full max-w-md border-destructive/40 shadow-royal text-center">
                <CardHeader className="space-y-4">
                    <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                        <AlertTriangle className="w-8 h-8 text-destructive" />
                    </div>
                    <div>
                        <CardTitle className="text-xl sm:text-2xl font-display">
                            {title || "Something went wrong"}
                        </CardTitle>
                        <CardDescription className="mt-2">
                            {description || "An unexpected error occurred. You can try again, or go back to the home page."}
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    {import.meta.env.DEV && message && (
                        <pre className="text-xs text-left text-muted-foreground bg-secondary/30 rounded-lg p-3 overflow-auto max-h-32">
                            {message}
                        </pre>
                    )}
                    <Button onClick={() => resetErrorBoundary()} className="w-full font-semibold gap-2">
                        <RotateCcw className="w-4 h-4" />
                        Try Again
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full gap-2"
                        onClick={() => {
                            window.location.href = homePath;
                        }}
                    >
                        <Home className="w-4 h-4" />
                        Go to Home
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
