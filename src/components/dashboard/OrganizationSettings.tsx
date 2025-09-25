import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { EcoButton } from "@/components/ui/eco-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useProfile } from "@/hooks/useProfile"
import { toast } from "sonner"

interface OrganizationSettingsProps {
  isOpen: boolean
  onClose: () => void
}

export function OrganizationSettings({ isOpen, onClose }: OrganizationSettingsProps) {
  const { profile, updateProfile, isUpdating } = useProfile()
  const [formData, setFormData] = useState({
    organizationName: profile?.organization_name || "",
    displayName: profile?.display_name || "",
    regionDistrict: profile?.region_district || "",
    regionState: profile?.region_state || "",
    regionCountry: profile?.region_country || "India"
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    updateProfile({
      organization_name: formData.organizationName,
      display_name: formData.displayName,
      region_district: formData.regionDistrict,
      region_state: formData.regionState,
      region_country: formData.regionCountry
    })

    toast.success("Organization settings updated successfully!")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Organization Settings</DialogTitle>
          <DialogDescription>
            Update your organization profile and location information.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="organizationName">Organization Name</Label>
            <Input
              id="organizationName"
              value={formData.organizationName}
              onChange={(e) => setFormData(prev => ({ ...prev, organizationName: e.target.value }))}
              placeholder="Enter organization name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={formData.displayName}
              onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
              placeholder="Enter display name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="regionDistrict">District</Label>
            <Input
              id="regionDistrict"
              value={formData.regionDistrict}
              onChange={(e) => setFormData(prev => ({ ...prev, regionDistrict: e.target.value }))}
              placeholder="Enter district"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="regionState">State</Label>
            <Input
              id="regionState"
              value={formData.regionState}
              onChange={(e) => setFormData(prev => ({ ...prev, regionState: e.target.value }))}
              placeholder="Enter state"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="regionCountry">Country</Label>
            <Input
              id="regionCountry"
              value={formData.regionCountry}
              onChange={(e) => setFormData(prev => ({ ...prev, regionCountry: e.target.value }))}
              placeholder="Enter country"
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <EcoButton type="submit" disabled={isUpdating} className="flex-1">
              {isUpdating ? "Updating..." : "Save Changes"}
            </EcoButton>
            <EcoButton type="button" variant="outline" onClick={onClose}>
              Cancel
            </EcoButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}