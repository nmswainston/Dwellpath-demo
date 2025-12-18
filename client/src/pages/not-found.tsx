import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import Footer from "@/components/shared/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col bg-background">
      <main className="flex-1 w-full flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="flex mb-4 gap-2">
              <AlertCircle className="h-8 w-8 text-[hsl(var(--destructive))] opacity-80" />
              <h1 className="text-2xl font-bold text-foreground">404 Page Not Found</h1>
            </div>

            <p className="mt-4 text-sm text-muted-foreground">
              This page doesn't exist or the link is outdated. Use the navigation to return to a valid page.
            </p>
            {import.meta.env.DEV && (
              <p className="mt-2 text-xs text-muted-foreground">
                Did you forget to add the page to the router?
              </p>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer className="mt-auto" />
    </div>
  );
}
