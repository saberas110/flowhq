from django.db import models
from django.db.models import Prefetch




class ConversationQuerySet(models.QuerySet):
    def optimized_for_list(self):
        from chat_manager.models import Message, ContactTag

        data = (self.select_related('organization', 'contact')
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
        from chat_manager.models import Message, ChannelIdentity
        data = self.select_related('organization', 'contact').prefetch_related(
            Prefetch(
                'messages',
                queryset=Message.objects.order_by('created_at')[:message_limit],
                to_attr='_cached_messages'
            ),
            Prefetch(
                'contact__identities',
                queryset=ChannelIdentity.objects.all(),
                to_attr='_cached_identites'
            )
             
            
        )
        return data


    

class ConversationManager(models.Manager):
    def get_queryset(self) -> "ConversationQuerySet":
        return ConversationQuerySet(self.model, using=self._db)

    def optimized_for_list(self) -> "ConversationQuerySet":
        return self.get_queryset().optimized_for_list()

    def optimized_for_detail(self, message_limit: int = 50) -> "ConversationQuerySet":
        return self.get_queryset().optimized_for_detail(message_limit)






