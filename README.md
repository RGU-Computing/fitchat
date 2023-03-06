<img src="https://raw.githubusercontent.com/RGU-Computing/fitchat/master/assets/bot.png">
<a href="https://doi.org/10.5281/zenodo.7702586"><img src="https://zenodo.org/badge/DOI/10.5281/zenodo.7702586.svg" alt="DOI"></a>


# FitChat: Conversational Artificial Intelligence Interventions for Encouraging Physical Activity in Older Adults

Delivery of digital behaviour change interventions which encourage physical activity has been tried in many forms. Most often interventions are delivered as text notifications, but these do not promote interaction. Advances in conversational AI have improved natural language understanding and generation, allowing AI chatbots to provide an engaging experience with the user. For this reason, chatbots have recently been seen in healthcare delivering digital interventions through free text or choice selection. We explore the use of voice based AI chatbots as a novel mode of intervention delivery, specifically targeting older adults to encourage physical activity. We co-created the AI chatbot 'FitChat', with older adults from the community and we evaluate the first prototype using Think Aloud Sessions. Our thematic evaluation suggests that older adults prefer voice based chat over text notifications or free text entry and that voice is a powerful mode for encouraging motivation.
Please download our [technical paper](https://getamoveon.ac.uk/media/pages/funded-projects/conversational-intervention/3732446674-1581531361/nirmali-wiratunga-fitchat-full-technical-report.pdf) for more details.

## Screenshots

<img src="https://raw.githubusercontent.com/RGU-Computing/fitchat/master/assets/screenshot.png" width="800">

## System Design 

<img src="https://raw.githubusercontent.com/RGU-Computing/fitchat/master/assets/fitchat.jpg" width="700">

## Setting up the Project
1. Follow the guide [here](https://cloud.google.com/dialogflow/docs/quick) for getting started with DialogFlow. Download and import the zipped folder 'FitChatBot' to get started with our FitChat bot. 
2. Follow the guide [here](https://firebase.google.com/docs/projects/learn-more) for getting started with Firebase. We use Firebase for hosting the Cloud Functions, storage and mobile app authentication. 
3. Follow the guide [here](https://github.com/dialogflow/dialogflow-fulfillment-nodejs) to create the firebase cloud function and connect it as the webhook for of the DialogFlow Chatbot.  

## Contributing to FitChat

Submit a pull request to contribute to the FitChat project. 

a. Create new or improve conversational skills

b. Add messages to the Motivational Message Bank (More information on the Message Bank will be added soon.)

c. Improve the mobile application


----

## Funding 

This project is funded by the GetAMoveOn Network+ (funded by the Engineering and Physical Sciences Research Council, UK (EPSRC) under the grant number: EP/N027299/1) and the SelfBACK Project (funded by the European Union's H2020 research and innovation programme under grant agreement No. 689043).


----
Repo Maintained by [Anjana Wijekoon (RGU)](https://github.com/anjanaw) and [Benjamin Picard (RGU)](https://github.com/BenjaminPcrd/) 
