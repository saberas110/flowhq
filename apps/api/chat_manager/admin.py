from django.contrib import admin
from . import models


admin.site.register(models.Contact)
admin.site.register(models.ChannelIdentity)
admin.site.register(models.Conversation)
admin.site.register(models.ServiceAccount)
admin.site.register(models.Message)
admin.site.register(models.ContactTag)
admin.site.register(models.Organization)
admin.site.register(models.MessageReadStatus)
# admin.site.register(models.)
