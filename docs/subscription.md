There are two part's for the subscription process

# Subscription

- there are seperate endpoints for it , saveSubscription, deleteSubscription,subscription, subscriptions
- in this we can create subscriptions with features and other field
- For buy subscription ,please hit endpoint called buySubscription with subscription mongo objectId
- buySubscription will create Subscribe with payment cashfree.

# Subscribe

- subscibe is totaly different from subscription , don't confuse between them
- for subscibe we have two endpoints isSubscibe, mySubscibe
- subscibe is like user bought subscription, and it will be added in user's account
- isSubscibe will give us response like, user have currently active subscription or not (in case u not passed pid)
- if subscriptionId passed in isSubscibe endpoint then it will check that that subscription is active or not
- mySubscription enpoint will give the list of the subscriptions bought via user , also it will give a field name 'onGoing' : true(means currently use), false(means not in use at this time )

# Store subscription

- when user create his/her new store , then automatically FREE subscription will assigned to store.
- via defialt in migration it has some types of subscriptions.
