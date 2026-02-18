from django.contrib import admin
from polymorphic.admin import (
    PolymorphicParentModelAdmin,
    PolymorphicChildModelAdmin,
    PolymorphicChildModelFilter,
)
from . import models


# --- Polymorphic admin for Message hierarchy ---

@admin.register(models.EmailMessage)
class EmailMessageAdmin(PolymorphicChildModelAdmin):
    base_model = models.Message

@admin.register(models.WhatsAppMessage)
class WhatsAppMessageAdmin(PolymorphicChildModelAdmin):
    base_model = models.Message

@admin.register(models.Message)
class MessageAdmin(PolymorphicParentModelAdmin):
    base_model = models.Message
    child_models = (models.EmailMessage, models.WhatsAppMessage)
    list_filter = (PolymorphicChildModelFilter,)


# --- Polymorphic admin for ServiceAccount hierarchy ---

@admin.register(models.WhatsAppAccount)
class WhatsAppAccountAdmin(PolymorphicChildModelAdmin):
    base_model = models.ServiceAccount

@admin.register(models.EmailAccount)
class EmailAccountAdmin(PolymorphicChildModelAdmin):
    base_model = models.ServiceAccount

@admin.register(models.GmailAccounts)
class GmailAccountsAdmin(PolymorphicChildModelAdmin):
    base_model = models.ServiceAccount

@admin.register(models.ServiceAccount)
class ServiceAccountAdmin(PolymorphicParentModelAdmin):
    base_model = models.ServiceAccount
    child_models = (models.WhatsAppAccount, models.EmailAccount, models.GmailAccounts)
    list_filter = (PolymorphicChildModelFilter,)


# --- Standard registrations ---

admin.site.register(models.Contact)
admin.site.register(models.ChannelIdentity)
admin.site.register(models.Conversation)
admin.site.register(models.ContactTag)
admin.site.register(models.Organization)
