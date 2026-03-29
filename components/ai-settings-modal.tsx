"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CheckCircle, Loader2, AlertTriangle, Bot, MessageSquare, Star, Filter, Brain, Sliders, Shield, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/lib/use-user";
import type { TeamSettings } from "@/lib/types";

interface AiSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AiSettingsModal({ open, onOpenChange }: AiSettingsModalProps) {
  const { user, loading: userLoading } = useUser();
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [preferences, setPreferences] = useState<TeamSettings | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (!user?.teamId) {
      setIsLoading(false);
      return;
    }

    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setPreferences({
            autoDeleteDeclinedDays: data.autoDeleteDeclinedDays ?? 0,
            autoApproveEnabled: data.autoApproveEnabled ?? false,
            autoDeclineUnrelated: data.autoDeclineUnrelated ?? false,
            followUpDays: data.followUpDays ?? 3,
            followUpMessage: data.followUpMessage ?? "",
            aiEnabled: data.aiEnabled ?? true,
            autoApprove: data.autoApprove ?? false,
            autoDecline: data.autoDecline ?? false,
            autoManualReview: data.autoManualReview ?? true,
            minRatingThreshold: data.minRatingThreshold ?? 3,
            autoResponseEnabled: data.autoResponseEnabled ?? false,
            sentimentAnalysis: data.sentimentAnalysis ?? true,
            priorityDetection: data.priorityDetection ?? true,
            duplicateDetection: data.duplicateDetection ?? true,
            aiInstructions: data.aiInstructions ?? "",
          });
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [user?.teamId]);

  const handleToggle = async (key: keyof TeamSettings) => {
    if (!preferences || !user?.teamId) return;

    const newPrefs = { ...preferences, [key]: !preferences[key] };
    setPreferences(newPrefs);

    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: !preferences[key] })
      });
      if (res.ok) {
        showToast("AI preference saved", "success");
      } else {
        showToast("Failed to save", "error");
      }
    } catch {
      showToast("Error saving", "error");
    }
  };

  const handleRatingChange = async (value: number) => {
    if (!preferences || !user?.teamId) return;

    const newPrefs = { ...preferences, minRatingThreshold: value };
    setPreferences(newPrefs);

    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ minRatingThreshold: value })
      });
      if (res.ok) {
        showToast("Rating threshold updated", "success");
      }
    } catch {
      showToast("Error saving", "error");
    }
  };

  const handleInstructionsChange = (value: string) => {
    setPreferences({ ...preferences!, aiInstructions: value });
  };

  const handleSaveAll = async () => {
    if (!preferences || !user?.teamId) return;

    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aiEnabled: preferences.aiEnabled,
          autoApprove: preferences.autoApprove,
          autoDecline: preferences.autoDecline,
          autoManualReview: preferences.autoManualReview,
          minRatingThreshold: preferences.minRatingThreshold,
          autoResponseEnabled: preferences.autoResponseEnabled,
          sentimentAnalysis: preferences.sentimentAnalysis,
          priorityDetection: preferences.priorityDetection,
          duplicateDetection: preferences.duplicateDetection,
          aiInstructions: preferences.aiInstructions,
        })
      });
      if (res.ok) {
        showToast("All AI settings saved successfully", "success");
        onOpenChange(false);
      } else {
        showToast("Failed to save", "error");
      }
    } catch {
      showToast("Error saving", "error");
    }
  };

  const handleResetDefaults = async () => {
    if (!preferences || !user?.teamId) return;

    const defaultPrefs: TeamSettings = {
      autoDeleteDeclinedDays: 0,
      autoApproveEnabled: false,
      autoDeclineUnrelated: false,
      followUpDays: 3,
      followUpMessage: "",
      aiEnabled: true,
      autoApprove: false,
      autoDecline: false,
      autoManualReview: true,
      minRatingThreshold: 3,
      autoResponseEnabled: false,
      sentimentAnalysis: true,
      priorityDetection: true,
      duplicateDetection: true,
      aiInstructions: "",
    };
    setPreferences(defaultPrefs);

    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aiEnabled: defaultPrefs.aiEnabled,
          autoApprove: defaultPrefs.autoApprove,
          autoDecline: defaultPrefs.autoDecline,
          autoManualReview: defaultPrefs.autoManualReview,
          minRatingThreshold: defaultPrefs.minRatingThreshold,
          autoResponseEnabled: defaultPrefs.autoResponseEnabled,
          sentimentAnalysis: defaultPrefs.sentimentAnalysis,
          priorityDetection: defaultPrefs.priorityDetection,
          duplicateDetection: defaultPrefs.duplicateDetection,
          aiInstructions: defaultPrefs.aiInstructions,
          autoDeleteDeclinedDays: defaultPrefs.autoDeleteDeclinedDays,
          autoApproveEnabled: defaultPrefs.autoApproveEnabled,
          autoDeclineUnrelated: defaultPrefs.autoDeclineUnrelated,
          followUpDays: defaultPrefs.followUpDays,
          followUpMessage: defaultPrefs.followUpMessage,
        })
      });
      if (res.ok) {
        showToast("AI settings reset to defaults", "success");
      }
    } catch {
      showToast("Error resetting", "error");
    }
  };

  if (userLoading || isLoading || !preferences) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>AI Settings</DialogTitle>
          </DialogHeader>
          <DialogContent className="space-y-4">
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          </DialogContent>
        </DialogContent>
      </Dialog>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md space-y-6">
        <DialogHeader>
          <DialogTitle>AI Settings</DialogTitle>
          <DialogDescription>
            Customize how AI handles your leads
          </DialogDescription>
        </DialogHeader>
        <DialogContent className="space-y-6">
          {/* AI Enabled */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-medium">AI Features</Label>
              </div>
              <Switch
                checked={preferences.aiEnabled}
                onCheckedChange={(checked) => handleToggle("aiEnabled")}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Enable or disable AI-powered lead processing
            </p>
          </div>

          {/* Auto-Approve */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-primary" />
                <Label className="text-sm font-medium">Auto-Approve High-Quality Leads</Label>
              </div>
              <Switch
                checked={preferences.autoApprove}
                onCheckedChange={(checked) => handleToggle("autoApprove")}
              />
            </div>
            {preferences.autoApprove && (
              <div className="pl-6 space-y-3 border-l-2 border-primary/20">
                <p className="text-xs text-muted-foreground">
                  Automatically approve leads that meet your quality criteria and send them directly to n8n.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="min-rating" className="text-xs text-muted-foreground">
                    Minimum Rating to Auto-Approve
                  </Label>
                  <div className="flex items-center gap-3">
                    <input
                      id="min-rating"
                      type="number"
                      min="1"
                      max="5"
                      value={preferences.minRatingThreshold}
                      onChange={(e) => handleRatingChange(parseInt(e.target.value) || 3)}
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground">stars or higher</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Auto-Decline Unrelated */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-medium">Auto-Mark Unrelated Messages</Label>
              </div>
              <Switch
                checked={preferences.autoDeclineUnrelated}
                onCheckedChange={(checked) => handleToggle("autoDeclineUnrelated")}
              />
            </div>
            {preferences.autoDeclineUnrelated && (
              <div className="pl-6 border-l-2 border-muted">
                <p className="text-xs text-muted-foreground">
                  Automatically mark messages that don&apos;t appear to be leads as &quot;Unrelated&quot;.
                  These will be stored separately and can be deleted automatically.
                </p>
              </div>
            )}
          </div>

          {/* Auto-Response */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-medium">Auto-Response for New Leads</Label>
              </div>
              <Switch
                checked={preferences.autoResponseEnabled}
                onCheckedChange={(checked) => handleToggle("autoResponseEnabled")}
              />
            </div>
            {preferences.autoResponseEnabled && (
              <div className="pl-6 space-y-3 border-l-2 border-muted">
                <p className="text-xs text-muted-foreground">
                  Automatically send a response message when a new lead is detected.
                </p>
              </div>
            )}
          </div>

          {/* Sentiment Analysis */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-medium">Sentiment Analysis</Label>
              </div>
              <Switch
                checked={preferences.sentimentAnalysis}
                onCheckedChange={(checked) => handleToggle("sentimentAnalysis")}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Analyze the emotional tone of incoming messages to prioritize leads
            </p>
          </div>

          {/* Priority Detection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-medium">Priority Detection</Label>
              </div>
              <Switch
                checked={preferences.priorityDetection}
                onCheckedChange={(checked) => handleToggle("priorityDetection")}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Automatically detect and flag high-priority leads based on message content
            </p>
          </div>

          {/* Duplicate Detection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-medium">Duplicate Detection</Label>
              </div>
              <Switch
                checked={preferences.duplicateDetection}
                onCheckedChange={(checked) => handleToggle("duplicateDetection")}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Prevent processing of duplicate leads based on phone number or email
            </p>
          </div>

          {/* AI Instructions */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
                <MessageSquare className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-medium text-slate-800">Custom Instructions</p>
                <p className="text-sm text-slate-500">Tell the AI how to handle your leads</p>
              </div>
            </div>
            <textarea
              value={preferences.aiInstructions || ""}
              onChange={(e) => handleInstructionsChange(e.target.value)}
              disabled={!preferences.aiEnabled}
              placeholder="E.g., Always prioritize leads from Los Angeles, decline inquiries for projects under $1000, flag leads mentioning 'urgent' as high priority..."
              className={cn(
                "w-full px-3 py-2 rounded-lg border border-slate-200 resize-none focus:border-blue-400 focus:outline-none text-slate-700 placeholder:text-slate-400",
                !preferences.aiEnabled && "opacity-50 bg-slate-50"
              )}
              rows={5}
            />
            <p className="text-xs text-slate-500 mt-2">
              Be specific about your preferences, priorities, and any special handling rules.
            </p>
          </div>
        </DialogContent>

        {toast && (
          <div className={cn(
            "fixed bottom-6 right-6 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border transition-all",
            toast.type === "success" && "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-700",
            toast.type === "error" && "bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-700",
            toast.type === "info" && "bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-700"
          )}>
            {toast.type === "success" && <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
            {toast.type === "error" && <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />}
            {toast.type === "info" && <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{toast.message}</span>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="cursor-pointer">
            Cancel
          </Button>
          <Button onClick={handleSaveAll} disabled={isLoading} className="cursor-pointer">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save All Settings"
            )}
          </Button>
          <Button
            onClick={handleResetDefaults}
            variant="outline"
            size="sm"
            className="ml-3 cursor-pointer"
          >
            Reset to Defaults
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}