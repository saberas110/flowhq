from django.db import models
from django.db.models import Prefetch

class ConversationQuerySet(models.QuerySet):
    def optimized_for_list(self):
        from chat_manager.models import Message, ChannelIdentity, ContactTag
        data = (self.select_related('organization', 'contact' )
                .prefetch_related(
                    Prefetch(
                        'messages',
                        queryset=Message.objects.order_by('-created_at')[:1],
                        to_attr='_cached_last_message'
                    ),
                    Prefetch(
                        'contact__tags',
                        queryset=ContactTag.objects.all(),
                        to_attr='_cached_tags'
                    )
                ))
        return data

    def optimized_for_detail(self, message_limit=50):
        from chat_manager.models import Message
        data = self.select_related('organization', 'contact').prefetch_related(
            Prefetch(
                'messages',
                queryset=Message.objects.order_by('created_at')[:message_limit],
                to_attr='_cached_messages'
            )
        )
        return data

class ConversationManager(models.Manager):
    def get_queryset(self):
        return ConversationQuerySet(self.model, using=self._db)






