import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { propertiesApi } from "@/lib/apiClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { handleUnauthorized } from "@/lib/handleUnauthorized";
import { cn } from "@/lib/utils";
import AppLayout from "@/components/layout/AppLayout";
import { StaggeredPageContent } from "@/components/layout/PageTransition";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Home, MapPin, Plus, Edit, Trash2, Calendar, DollarSign, Building, Camera, X, Upload } from "lucide-react";
import { Property } from "@shared/schema";
import { PropertyAddressField } from "@/components/ui/property-address-field";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import { APP_MODAL_CONTENT_BASE_CLASSNAME, APP_MODAL_CONTENT_FIXED_SIZE_CLASSNAME, APP_MODAL_CONTENT_SCROLL_CLASSNAME, APP_MODAL_OVERLAY_CLASSNAME } from "@/lib/modalStyles";
import { StateSelectItem } from "@/components/shared/StateSelectItem";

const US_STATES = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
];

const PROPERTY_TYPES = [
  { value: "primary", label: "Primary Residence" },
  { value: "secondary", label: "Secondary Home" },
  { value: "rental", label: "Rental Property" },
];

interface PropertyFormData {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: string;
  purchaseDate?: string;
  estimatedValue?: string;
  notes?: string;
  imageUrl?: string;
}

function EditPropertyForm({ property, onSuccess }: { property: Property; onSuccess: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<PropertyFormData, any, PropertyFormData>({
    defaultValues: {
      name: property.name ?? "",
      address: property.address ?? "",
      city: property.city ?? "",
      state: property.state ?? "",
      zipCode: property.zipCode ?? "",
      propertyType: property.propertyType ?? "",
      purchaseDate: property.purchaseDate 
        ? new Date(property.purchaseDate).toISOString().split('T')[0] 
        : "",
      estimatedValue: property.estimatedValue?.toString() || "",
      notes: property.notes || "",
      imageUrl: property.imageUrl || "",
    },
  });

  const updatePropertyMutation = useMutation({
    mutationFn: async (data: PropertyFormData) => {
      const payload = {
        ...data,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
        estimatedValue: data.estimatedValue || null,
      };
      return propertiesApi.update(property.id, payload as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      toast({
        title: "Property Updated",
        description: "Your property has been updated successfully.",
      });
      form.reset();
      onSuccess();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        handleUnauthorized(toast);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update property. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deletePropertyMutation = useMutation({
    mutationFn: async () => {
      return propertiesApi.delete(property.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      toast({
        title: "Property Deleted",
        description: "Your property has been deleted successfully.",
      });
      onSuccess();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        handleUnauthorized(toast);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete property. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PropertyFormData) => {
    updatePropertyMutation.mutate(data);
  };

  const handleDelete = () => {
    const propertyName = property.name || "this property";
    if (window.confirm(`Are you sure you want to permanently delete "${propertyName}"?\n\nThis action cannot be undone and will remove all associated data from your portfolio.`)) {
      deletePropertyMutation.mutate();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 leading-relaxed">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Property Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="My Beach House" 
                  autoComplete="organization" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Street Address</FormLabel>
              <FormControl>
                <Input 
                  placeholder="123 Main Street" 
                  autoComplete="street-address" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Miami" 
                    autoComplete="address-level2" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="zipCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ZIP Code</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="33101" 
                    autoComplete="postal-code" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="state"
          render={({ field }) => (
            <FormItem>
              <FormLabel>State</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a state" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {US_STATES.map((state) => (
                    <StateSelectItem
                      key={state.code}
                      value={state.code}
                      stateCode={state.code}
                      label={state.name}
                    />
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="propertyType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Property Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PROPERTY_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField
            control={form.control}
            name="purchaseDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purchase Date (Optional)</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="estimatedValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estimated Value (Optional)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="500000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field: { value, onChange, ...field } }) => (
            <FormItem>
              <FormLabel>Property Photo (Optional)</FormLabel>
              <FormControl>
                <div className="space-y-3">
                  <Input 
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          onChange(event.target?.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-muted file:text-foreground hover:file:bg-muted/80"
                    {...field}
                  />
                  {value && (
                    <div className="relative w-32 h-24 rounded-lg overflow-hidden border">
                      <img 
                        src={value} 
                        alt="Property preview" 
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => onChange("")}
                        className="absolute top-1 right-1 bg-[hsl(var(--destructive)/0.12)] border border-[hsl(var(--destructive)/0.25)] text-[hsl(var(--destructive))] rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-[hsl(var(--destructive)/0.18)]"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Additional property details..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="sticky bottom-0 pt-4 border-t bg-card">
          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deletePropertyMutation.isPending}
              className="flex items-center justify-center gap-2"
            >
              <Trash2 className="h-4 w-4 text-destructive-foreground" />
              {deletePropertyMutation.isPending ? "Deleting..." : "Delete"}
            </Button>

            <Button
              type="submit"
              className="flex items-center justify-center"
              disabled={updatePropertyMutation.isPending}
            >
              {updatePropertyMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}

function PropertyForm({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<PropertyFormData, any, PropertyFormData>({
    defaultValues: {
      name: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      propertyType: "",
      purchaseDate: "",
      estimatedValue: "",
      notes: "",
      imageUrl: "",
    },
  });

  const createPropertyMutation = useMutation({
    mutationFn: async (data: PropertyFormData) => {
      const payload = {
        ...data,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
        estimatedValue: data.estimatedValue || null,
      };
      return propertiesApi.create(payload as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      toast({
        title: "Success",
        description: "Property added successfully!",
      });
      onSuccess();
      form.reset();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        handleUnauthorized(toast);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to add property. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PropertyFormData) => {
    createPropertyMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 leading-relaxed">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Property Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="My Beach House" 
                  autoComplete="organization" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Street Address</FormLabel>
              <FormControl>
                <Input 
                  placeholder="123 Main Street" 
                  autoComplete="street-address" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Miami" 
                    autoComplete="address-level2" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="zipCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ZIP Code</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="33101" 
                    autoComplete="postal-code" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="state"
          render={({ field }) => (
            <FormItem>
              <FormLabel>State</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a state" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {US_STATES.map((state) => (
                    <StateSelectItem
                      key={state.code}
                      value={state.code}
                      stateCode={state.code}
                      label={state.name}
                    />
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="propertyType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Property Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PROPERTY_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField
            control={form.control}
            name="purchaseDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purchase Date (Optional)</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="estimatedValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estimated Value (Optional)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="500000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field: { value, onChange, ...field } }) => (
            <FormItem>
              <FormLabel>Property Photo (Optional)</FormLabel>
              <FormControl>
                <div className="space-y-3">
                  <Input 
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          onChange(event.target?.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-muted file:text-foreground hover:file:bg-muted/80"
                    {...field}
                  />
                  {value && (
                    <div className="relative w-32 h-24 rounded-lg overflow-hidden border">
                      <img 
                        src={value} 
                        alt="Property preview" 
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => onChange("")}
                        className="absolute top-1 right-1 bg-[hsl(var(--destructive)/0.12)] border border-[hsl(var(--destructive)/0.25)] text-[hsl(var(--destructive))] rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-[hsl(var(--destructive)/0.18)]"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Additional property details..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="sticky bottom-0 pt-4 border-t bg-card">
          <Button
            type="submit"
            className="w-full"
            disabled={createPropertyMutation.isPending}
          >
            {createPropertyMutation.isPending ? "Adding Property..." : "Add Property"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

function PropertyCard({ property, onEdit }: { property: Property; onEdit: (property: Property) => void }) {
  const getPropertyTypeColor = (type: string) => {
    switch (type) {
      case "primary":
        return "bg-[hsl(var(--primary)/0.10)] text-[hsl(var(--primary))] border border-[hsl(var(--primary)/0.20)]";
      case "secondary":
        return "bg-[hsl(var(--brand-sand-muted))] text-foreground border border-[hsl(var(--brand-sand-border))]";
      case "rental":
        return "bg-[hsl(var(--status-neutral)/0.10)] text-[hsl(var(--status-neutral))] border border-[hsl(var(--status-neutral)/0.20)]";
      default:
        return "bg-muted text-foreground border border-border";
    }
  };

  const formatPropertyType = (type: string) => {
    return PROPERTY_TYPES.find(pt => pt.value === type)?.label || type;
  };

  const formatCurrency = (value?: string | null) => {
    if (!value) return null;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(value));
  };

  return (
    <Card 
      className="transition-all duration-200 hover:shadow-lg border border-border shadow-sm cursor-pointer" 
      onClick={() => onEdit(property)}
    >
      {property.imageUrl && (
        <div className="relative w-full h-48 overflow-hidden rounded-t-xl">
          <img 
            src={property.imageUrl} 
            alt={property.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}
      <CardHeader className="pb-4">
        <div className="mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center justify-center w-8 h-8 bg-muted rounded-lg shrink-0">
              {property.imageUrl ? (
                <Camera className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Building className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <Badge className={getPropertyTypeColor(property.propertyType)}>
              {formatPropertyType(property.propertyType)}
            </Badge>
          </div>
        </div>
        <CardTitle className="text-lg font-semibold leading-tight break-words">{property.name}</CardTitle>
        <CardDescription className="flex items-center gap-1 text-sm">
          <MapPin className="h-4 w-4 shrink-0" />
          <span className="truncate min-w-0 flex-1">{property.address}</span>
        </CardDescription>
        <CardDescription className="text-sm text-muted-foreground break-words">
          {property.city}, {property.state} {property.zipCode}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {property.estimatedValue && (
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="font-medium text-foreground min-w-0 flex-1 truncate">
              {formatCurrency(property.estimatedValue)}
            </span>
          </div>
        )}
        
        {property.purchaseDate && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 shrink-0" />
            <span className="min-w-0 flex-1 truncate">
              Purchased {new Date(property.purchaseDate).toLocaleDateString()}
            </span>
          </div>
        )}
        
        {property.notes && (
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {property.notes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function PropertiesPage() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      handleUnauthorized(toast);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: properties = [], isLoading: propertiesLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
    enabled: isAuthenticated,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <AppLayout 
      title="Properties" 
      subtitle="Manage your real estate portfolio"
    >
      <div className="page-container">
        <StaggeredPageContent>
            <div className="w-full space-y-8">
              {/* Page Header */}
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tight text-foreground">Properties</h1>
                  <p className="text-lg text-muted-foreground">
                    Manage your real estate portfolio and track state ties
                  </p>
                </div>
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                  <DialogTrigger asChild>
                    <Button size="lg">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Property
                    </Button>
                  </DialogTrigger>
                  <DialogContent
                    overlayClassName={APP_MODAL_OVERLAY_CLASSNAME}
                    className={cn(
                      APP_MODAL_CONTENT_BASE_CLASSNAME,
                      APP_MODAL_CONTENT_FIXED_SIZE_CLASSNAME,
                      "p-0 overflow-hidden flex flex-col"
                    )}
                  >
                    {/* Header (fixed) */}
                    <div className="shrink-0 px-6 sm:px-8 pt-6 pb-4 border-b border-foreground/10">
                      <DialogHeader>
                        <DialogTitle>Add New Property</DialogTitle>
                        <DialogDescription className="leading-relaxed">
                          Add a property to track your residency ties and state presence.
                        </DialogDescription>
                      </DialogHeader>
                    </div>

                    {/* Body (scrollable) */}
                    <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 sm:px-8 py-6">
                      <div className="mx-auto w-full max-w-4xl">
                        <PropertyForm onSuccess={() => setShowAddDialog(false)} />
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                {/* Edit Property Dialog */}
                <Dialog open={!!editingProperty} onOpenChange={() => setEditingProperty(null)}>
                  <DialogContent
                    overlayClassName={APP_MODAL_OVERLAY_CLASSNAME}
                    className={cn(
                      APP_MODAL_CONTENT_BASE_CLASSNAME,
                      APP_MODAL_CONTENT_FIXED_SIZE_CLASSNAME,
                      "p-0 overflow-hidden flex flex-col"
                    )}
                  >
                    {/* Header (fixed) */}
                    <div className="shrink-0 px-6 sm:px-8 pt-6 pb-4 border-b border-foreground/10">
                      <DialogHeader className="text-left space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="flex items-center justify-center w-10 h-10 bg-muted border border-border rounded-lg shrink-0">
                            <Edit className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <DialogTitle className="text-xl font-semibold">Edit Property Details</DialogTitle>
                            <DialogDescription className="text-base mt-1 leading-relaxed">
                              Manage your property information, upload photos, and maintain accurate records for your portfolio.
                            </DialogDescription>
                          </div>
                        </div>
                      </DialogHeader>
                    </div>

                    {/* Body (scrollable) */}
                    <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 sm:px-8 py-6">
                      <div className="mx-auto w-full max-w-4xl">
                        {editingProperty && (
                          <EditPropertyForm
                            property={editingProperty}
                            onSuccess={() => setEditingProperty(null)}
                          />
                        )}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Properties Content */}
              <div className="space-y-6">
                {propertiesLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <CardHeader className="space-y-3">
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="h-3 bg-muted rounded"></div>
                            <div className="h-3 bg-muted rounded w-2/3"></div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : properties.length === 0 ? (
                  <Card className="border-dashed border-2">
                    <CardContent className="flex flex-col items-center justify-center py-16 px-6">
                      <div className="flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-6">
                        <Building className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-xl font-semibold text-center mb-2">No Properties Yet</h3>
                      <p className="text-muted-foreground text-center mb-6 max-w-md">
                        Start building your portfolio by adding your first property.
                        Track homes, rentals, and their impact on your tax residency.
                      </p>
                      <Button onClick={() => setShowAddDialog(true)} size="lg">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Property
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-foreground">
                        Your Properties ({properties.length})
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {properties.map((property) => (
                        <PropertyCard 
                          key={property.id} 
                          property={property} 
                          onEdit={setEditingProperty}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
        </StaggeredPageContent>
      </div>
    </AppLayout>
  );
}