"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Mail, Eye, EyeOff } from "lucide-react";
import { emailConnect } from "@/http/chat/emailConnectApi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z
  .object({
    email: z.string().email("Please enter a valid email address."),
    app_password: z
      .string()
      .min(8, "App password must be at least 8 characters."),
    provider: z.enum(["gmail", "outlook", "yahoo", "custom"]),
    imap_host: z.string().optional(),
    imap_port: z.number().optional(),
    smtp_host: z.string().optional(),
    smtp_port: z.number().optional(),
    folder: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.provider === "custom") {
        return !!data.imap_host && data.imap_host.length > 0;
      }
      return true;
    },
    {
      message: "IMAP host is required for custom provider.",
      path: ["imap_host"],
    }
  )
  .refine(
    (data) => {
      if (data.provider === "custom") {
        return !!data.smtp_host && data.smtp_host.length > 0;
      }
      return true;
    },
    {
      message: "SMTP host is required for custom provider.",
      path: ["smtp_host"],
    }
  );

type ConnectEmailForm = z.infer<typeof formSchema>;

interface ConnectEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ConnectEmailDialog({
  open,
  onOpenChange,
  onSuccess,
}: ConnectEmailDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ConnectEmailForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      app_password: "",
      provider: "gmail",
      imap_host: "",
      imap_port: 993,
      smtp_host: "",
      smtp_port: 587,
      folder: "INBOX",
    },
  });

  const selectedProvider = watch("provider");
  const isCustomProvider = selectedProvider === "custom";

  const onSubmit = async (values: ConnectEmailForm) => {
    setIsLoading(true);

    try {
      const payload = {
        email: values.email,
        app_password: values.app_password,
        provider: values.provider,
        ...(isCustomProvider && {
          imap_host: values.imap_host,
          imap_port: values.imap_port,
          smtp_host: values.smtp_host,
          smtp_port: values.smtp_port,
        }),
        folder: values.folder || "INBOX",
      };

      await emailConnect(payload);

      toast.success("Email connected successfully!");
      reset();
      onOpenChange(false);
      onSuccess?.();

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Connect email error:", error);
      const message =
        error.response?.data?.error ||
        error.response?.data?.details ||
        error.message ||
        "Failed to connect email. Please check your credentials.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      reset();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Connect Email Account
          </DialogTitle>
          <DialogDescription>
            Connect your email using IMAP/SMTP with an app password for secure
            access.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register("email")}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* App Password */}
          <div className="space-y-2">
            <Label htmlFor="app_password">App Password</Label>
            <div className="relative">
              <Input
                id="app_password"
                type={showPassword ? "text" : "password"}
                placeholder="Your app password"
                {...register("app_password")}
                className={errors.app_password ? "border-red-500 pr-10" : "pr-10"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.app_password && (
              <p className="text-sm text-red-500">
                {errors.app_password.message}
              </p>
            )}
          </div>

          {/* Provider */}
          <div className="space-y-2">
            <Label htmlFor="provider">Email Provider</Label>
            <Select
              value={selectedProvider}
              onValueChange={(value) =>
                setValue("provider", value as ConnectEmailForm["provider"])
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gmail">Gmail</SelectItem>
                <SelectItem value="outlook">Outlook / Office 365</SelectItem>
                <SelectItem value="yahoo">Yahoo Mail</SelectItem>
                <SelectItem value="custom">Custom IMAP/SMTP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Provider Fields */}
          {isCustomProvider && (
            <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm font-medium text-gray-700">
                Custom Server Settings
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="imap_host">IMAP Host</Label>
                  <Input
                    id="imap_host"
                    placeholder="imap.example.com"
                    {...register("imap_host")}
                    className={errors.imap_host ? "border-red-500" : ""}
                  />
                  {errors.imap_host && (
                    <p className="text-sm text-red-500">
                      {errors.imap_host.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imap_port">IMAP Port</Label>
                  <Input
                    id="imap_port"
                    type="number"
                    placeholder="993"
                    {...register("imap_port", { valueAsNumber: true })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp_host">SMTP Host</Label>
                  <Input
                    id="smtp_host"
                    placeholder="smtp.example.com"
                    {...register("smtp_host")}
                    className={errors.smtp_host ? "border-red-500" : ""}
                  />
                  {errors.smtp_host && (
                    <p className="text-sm text-red-500">
                      {errors.smtp_host.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtp_port">SMTP Port</Label>
                  <Input
                    id="smtp_port"
                    type="number"
                    placeholder="587"
                    {...register("smtp_port", { valueAsNumber: true })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Folder */}
          <div className="space-y-2">
            <Label htmlFor="folder">Sync Folder</Label>
            <Input
              id="folder"
              placeholder="INBOX"
              {...register("folder")}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Connect
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
