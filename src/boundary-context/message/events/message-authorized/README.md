# Event: `message.authorized`

The `message.authorized` event is one of the initial events in our system. It is triggered each time a user sends a message to our system and the message passes through our filter to be processed further.

<!-- A brief description of what this domain event represents. -->

## Event Data

<!-- A description of the data included in the event. This could include any relevant attributes, metadata, or relationships. -->

- `messageId`, provides an `id` of `Message` in database which was just created.

## Event Handlers

<!-- A list of event handlers that will be triggered when this domain event is emitted. -->

- `prompt/after.message-authorized.customer`, handles newly created messages in our system to create `Prompt` entity and produce `prompt.created` event which can be handled in futher parts of software.

## Example Usage

<!-- A code example of how to emit this domain event, including any necessary data. -->

<!-- // Example code for emitting this domain event -->

## Related Domain Events

<!-- A list of any related domain events that are triggered by this event or that trigger this event. -->

- [Prompt Created](../../../prompt/events/prompt-created/README.md)

## Further Reading

<!-- Any additional resources or documentation related to this domain event. -->
