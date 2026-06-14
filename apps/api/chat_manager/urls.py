from django.urls import path, include
from rest_framework.routers import DefaultRouter

from chat_manager import views

router = DefaultRouter()
router.register("schema", views.SchemaViewSet, basename="schema")

urlpatterns = [
    path("ouath2callback", views.GmailAuthCallbackView.as_view()),
    path("webhooks/gmail", views.GmailWebHook.as_view()),
    path("gmail/auth/start", views.GmailAuthStartView.as_view()),
    path("email/connect", views.ConnectEmailView.as_view()),
    # WhatsApp API endpoints (Evolution API)
    path("whatsapp/connect", views.WhatsAppConnectView.as_view()),
    path("whatsapp/status", views.WhatsAppStatusView.as_view()),
    path("whatsapp/qr", views.WhatsAppQrView.as_view()),
    # path("whatsapp/send", views.WhatsAppSendMessageView.as_view()),
    path("whatsapp/disconnect", views.WhatsAppDisconnectView.as_view()),
    path("whatsapp/cancel", views.WhatsAppCancelConnectView.as_view()),
    # Webhook (Evolution API sends events here)
    path("webhook/whatsapp", views.EvolutionWebhookView.as_view()),
    path("", include(router.urls)),
]
