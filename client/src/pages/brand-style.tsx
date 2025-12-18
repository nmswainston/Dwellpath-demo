import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DwellpathLogo } from "@/components/branding/DwellpathLogo";
import ElegantIconGrid from "@/components/icons/ElegantIconGrid";
import { 
  Palette, 
  Type, 
  Layout, 
  Component, 
  Eye, 
  Lightbulb,
  Copy,
  Check
} from "lucide-react";
import { useState } from "react";

export default function BrandStyle() {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedColor(label);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const ColorCard = ({ 
    name, 
    lightValue, 
    darkValue, 
    description,
    className 
  }: {
    name: string;
    lightValue: string;
    darkValue: string;
    description: string;
    className: string;
  }) => (
    <Card className="overflow-hidden">
      <div className={`h-20 ${className} relative group cursor-pointer`}
           onClick={() => copyToClipboard(lightValue, name)}>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {copiedColor === name ? (
            <Check className="h-5 w-5 text-white" />
          ) : (
            <Copy className="h-5 w-5 text-white" />
          )}
        </div>
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{name}</CardTitle>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-1 text-xs font-mono">
          <div>Light: {lightValue}</div>
          <div>Dark: {darkValue}</div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="page-container">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center mb-4">
            <DwellpathLogo variant="default" size="lg" />
          </div>
          <h1 className="font-heading text-3xl font-light">Brand Style Guide</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A comprehensive guide to Dwellpath's design system, featuring our sophisticated color palette, 
            elegant typography, and professional component library tailored for discerning clientele.
          </p>
        </div>

        {/* Brand Identity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-brand-primary dark:text-accent" />
              Brand Identity
            </CardTitle>
            <CardDescription>
              Dwellpath embodies sophistication, trust, and precision in wealth protection
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-muted rounded-lg mx-auto flex items-center justify-center border border-border">
                  <Lightbulb className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold">Trust & Security</h3>
                <p className="text-sm text-muted-foreground">
                  Professional-grade documentation and audit-ready compliance
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-brand-bg-light dark:bg-brand-bg-dark rounded-lg mx-auto flex items-center justify-center">
                  <Component className="h-8 w-8 text-brand-primary dark:text-brand-accent" />
                </div>
                <h3 className="font-semibold">Sophistication</h3>
                <p className="text-sm text-muted-foreground">
                  Elegant design language that appeals to wealthy clientele
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-muted rounded-lg mx-auto flex items-center justify-center border border-border">
                  <Layout className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold">Precision</h3>
                <p className="text-sm text-muted-foreground">
                  Accurate tracking and detailed compliance monitoring
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Color Palette */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-brand-primary dark:text-accent" />
              Color Palette
            </CardTitle>
            <CardDescription>
              Our sophisticated color system designed for both light and dark themes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <ColorCard
                name="Primary Navy"
                lightValue="#0B1D3A"
                darkValue="#0B1D3A"
                description="Primary background, headers"
                className="bg-brand-navy"
              />
              <ColorCard
                name="Primary Cream"
                lightValue="#F5F3E7"
                darkValue="#F5F3E7"
                description="Primary text, buttons"
                className="bg-brand-cream border"
              />
              <ColorCard
                name="Graphite Surface"
                lightValue="#1A1F1C"
                darkValue="#1A1F1C"
                description="Cards, modals, panels"
                className="bg-brand-graphite"
              />
              <ColorCard
                name="Muted Blue"
                lightValue="#C8D3E3"
                darkValue="#C8D3E3"
                description="Borders, dividers"
                className="bg-brand-mutedBlue border"
              />
              <ColorCard
                name="Ink Text"
                lightValue="#101418"
                darkValue="#101418"
                description="Light mode text"
                className="bg-brand-ink"
              />
              <ColorCard
                name="Light Background"
                lightValue="#F4EFE6"
                darkValue="#F4EFE6"
                description="Light mode bg"
                className="bg-brand-lightBg border"
              />
            </div>
          </CardContent>
        </Card>

        {/* Logo Variations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-brand-primary dark:text-accent" />
              Logo Variations
            </CardTitle>
            <CardDescription>
              Different logo formats for various applications and contexts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-4 p-6 border border-border rounded-xl bg-card shadow-sm">
                <DwellpathLogo variant="default" size="lg" />
                <div>
                  <h4 className="font-semibold">Full Logo</h4>
                  <p className="text-sm text-muted-foreground">Primary logo with icon and wordmark</p>
                </div>
              </div>
              <div className="text-center space-y-4 p-6 border border-border rounded-xl bg-card shadow-sm">
                <DwellpathLogo variant="minimal" size="lg" />
                <div>
                  <h4 className="font-semibold">Icon Only</h4>
                  <p className="text-sm text-muted-foreground">Minimal version for compact spaces</p>
                </div>
              </div>
              <div className="text-center space-y-4 p-6 border border-border rounded-xl bg-card shadow-sm">
                <DwellpathLogo variant="wordmark" size="lg" />
                <div>
                  <h4 className="font-semibold">Wordmark</h4>
                  <p className="text-sm text-muted-foreground">Text-only version for certain contexts</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Typography */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="h-5 w-5 text-brand-primary dark:text-accent" />
              Typography
            </CardTitle>
            <CardDescription>
              Elegant font pairings that convey sophistication and trust
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Playfair Display - Headings</h3>
                <div className="space-y-2">
                  <h1 className="dwellpath-heading text-4xl font-light">Track. Prove. Protect.</h1>
                  <h2 className="dwellpath-heading text-2xl font-normal">Precision Residency Tracking</h2>
                  <h3 className="dwellpath-heading text-xl font-medium">For Modern Wealth</h3>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Inter - Body Text</h3>
                <div className="space-y-2">
                  <p className="text-lg">Large body text for important descriptions and introductions</p>
                  <p className="text-base">Standard body text for general content and user interface elements</p>
                  <p className="text-sm text-muted-foreground">Small text for captions, metadata, and secondary information</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Components */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Component className="h-5 w-5 text-brand-primary dark:text-accent" />
              Component Library
            </CardTitle>
            <CardDescription>
              Professional UI components styled for sophisticated interfaces
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Buttons */}
            <div>
              <h3 className="font-semibold mb-4">Buttons</h3>
              <div className="flex flex-wrap gap-3">
                <Button>Primary Action</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
            </div>

            {/* Badges */}
            <div>
              <h3 className="font-semibold mb-4">Badges</h3>
              <div className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge className="bg-accent text-accent-foreground">Success</Badge>
                <Badge className="bg-[hsl(var(--status-warning)/0.10)] text-[hsl(var(--status-warning))] border border-[hsl(var(--status-warning)/0.20)]">Warning</Badge>
              </div>
            </div>

            {/* Form Elements */}
            <div>
              <h3 className="font-semibold mb-4">Form Elements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                <Input placeholder="Property name" />
                <Input placeholder="Email address" type="email" />
                <Textarea placeholder="Notes and additional details..." rows={3} className="md:col-span-2" />
              </div>
            </div>

            {/* Cards */}
            <div>
              <h3 className="font-semibold mb-4">Cards</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Property Details</CardTitle>
                    <CardDescription>Miami Beach Residence</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Premium oceanfront property with sophisticated amenities and audit-ready documentation.
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle>Compliance Status</CardTitle>
                    <CardDescription>Tax Year 2024</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge className="bg-brand-bg-light text-brand-text-light dark:bg-brand-bg-dark dark:text-brand-text-dark">
                      Fully Compliant
                    </Badge>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Elegant Iconography */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Component className="h-5 w-5 text-brand-primary dark:text-accent" />
              Sophisticated Iconography
            </CardTitle>
            <CardDescription>
              Modern, elegant icons that reflect navigation, confidence, privacy, tracking, trust, and compliance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ElegantIconGrid title="Trust & Tracking" size="md" />
          </CardContent>
        </Card>

        {/* Implementation Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Implementation Guidelines</CardTitle>
            <CardDescription>Best practices for maintaining brand consistency</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Color Usage</h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Use navy blue sparingly for primary actions and branding</li>
                <li>• Cool gray for subtle UI elements and secondary text</li>
                <li>• Maintain sufficient contrast ratios for accessibility</li>
                <li>• Test all colors in both light and dark themes</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Typography</h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Use Playfair Display for headings and brand elements</li>
                <li>• Inter for all body text and UI components</li>
                <li>• Maintain consistent line heights and spacing</li>
                <li>• Use font weights strategically for hierarchy</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Components</h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Follow established component patterns consistently</li>
                <li>• Use appropriate padding and margins from the design system</li>
                <li>• Ensure all interactive elements have proper hover states</li>
                <li>• Test components across different screen sizes</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}