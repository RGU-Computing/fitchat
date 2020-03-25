// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';


const { dialogflow } = require('actions-on-google');

const functions = require('firebase-functions');
const { WebhookClient } = require('dialogflow-fulfillment');
const admin = require('firebase-admin');
const { Card, Suggestion } = require('dialogflow-fulfillment');
const fs = require('fs');
var contents = fs.readFileSync("sentences.json");
const jsonContent = JSON.parse(contents);

admin.initializeApp(functions.config().firebase);

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
	const agent = new WebhookClient({ request, response });
	var fp_today_activities = [];
	var current_activity = '';
	var name = '';
	console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
	console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

	function welcome(agent) {
		agent.add(`Hello I'm FitChat! I can do the following things: \nset a fitness goal; \nrecord today's activities; \nget a summary of last week's activities; and \nbe an exercise coach to help you carry out exercises. \nwhat would you like to do?`);
		agent.add(`Tap the microphone button. When the icon is red, you can tell me what you want to do.`);
	}

	function fallback(agent) {
		agent.add(`I didn't understand`);
		agent.add(`I'm sorry, can you try again?`);
	}

	//Function just use to test
	async function test(agent) {
		addEXo(agent);
	}

	function parse(str) {
	    var args = [].slice.call(arguments, 1),
	        i = 0;
	    return str.replace(/%s/g, () => args[i++]);
	}

	function finish(agent) {
		agent.context.delete('mycontext');
	}

	function addEXo(agent){
  		var sessionRef = admin.firestore().collection('sessions');
		var setFit = sessionRef.doc('test').set({
        "name": "test",
        "exercises": [
            {
                "name": "exercise one",
                "steps": [
                    "ex 1 step 1",
                    "ex 1 step 2",
                    "ex 1 step 3"
                ]
            },
             {
                "name": "exercise two",
                "steps": [
                    "ex 2 step 1",
                    "ex 2 step 2",
                    "ex 2 step 3"
                ]
            }
        ]
        });
	}

	//save functions
	function saveToDB(agent, stepNumber, stepExNumber, nameEx) {
		console.log('saveToDB');
		let userId = getID(agent);
		var errors = "Error AddUser"
		admin.firestore().collection('users').where('userId', '==', userId).limit(1).get()
			.then(snapshot => {
				let user = snapshot.docs[0]
				if (!user) {
					console.log('saveToDB => USER NOT IN DB');
				} else {
					var usersRef = admin.firestore().collection('users');
					var setSf = usersRef.doc(userId).update({
						ec_data: {
							currentStep: stepNumber,
							currentStepEx: stepExNumber,
							currentExName: nameEx
						}
					});
					return null;
				}
				return null;
			})
			.catch(errors);
	}

	// get functions

	async function getMet(session) {
		console.log('getMet');
		var e;
		var sessionRef = admin.firestore().collection('sessions').doc(session);
		await sessionRef.get()
			.then(doc => {
				if (!doc.exists) {
					console.log('function getMet / No such document!');
					e = null;
				} else {
					e = doc.data().met;
				}
				throw (e)
			})
			.catch(err => {
				console.log('function getMets / Error getting document', err);
			});
		return e;
	}

	//Get the userID from the context
	function getID(agent) {
		const context = agent.getContext('userid');
		var id = context.parameters.id;
		return id;
	}
	//Not use
	//Get the ID from the DB
	async function getWeight(userId) {
		console.log('getWeight');
		var e;
		var sessionRef = admin.firestore().collection('users').doc(userId);
		await sessionRef.get()
			.then(doc => {
				if (!doc.exists) {
					console.log('function getWeight / No such document!');
					e = null;
				} else {
					e = doc.data().weight;
				}
				throw (e)
			})
			.catch(err => {
				console.log('function getWeight / Error getting document', err);
			});
		return e;
	}
	//Get all the exercises from a session
	async function getExercises(session, callback) {
		console.log('getExercises', session);
		var e;
		if(session !== undefined){
			var sessionRef = admin.firestore().collection('sessions').doc(session);
			await sessionRef.get()
				.then(doc => {
					if (!doc.exists) {
						console.log('function GETEXERCISES / No such document!');
						e = null;
					} else {
						e = doc.data().exercises;
					}
					throw (e)
				})
				.catch(err => {

					err = null;

					console.log('function GETEXERCISES / Error getting document', err);
				});
			return e;
		} else return null;


	}
	// find if the exercise is in the session
	// return Session Name if find else return Null
	async function findSessionOf(exercise, session) {
		console.log('findSessionOf');
		var name;
		var e;
		var sessionRef = admin.firestore().collection('sessions').doc(session);
		await sessionRef.get()
			.then(doc => {
				if (!doc.exists) {
					console.log('Function findSessionOf / No such document!');
					name = null;
				} else {
					session = doc.data().exercises;
					for (var i = 0; i < session.length; i++) {
						if (session[i].name === exercise) {
							e = session[i].name;
							name = doc.data().name;
						}
					}
				}
				throw (name)
			})
			.catch(err => {
				console.log(' Function findSessionOf /Error getting document', err);
			});
		console.log('Function findSessionOf /Before return => name :', name);
		return name;

	}
	// Get all session Name present in DB
	async function getAllSessions() {
		console.log('getAllSessions');
		var ArraySession;
		var sessionRef = admin.firestore().collection('sessions').doc('allSession');
		await sessionRef.get()
			.then(doc => {
				if (!doc.exists) {
					console.log('Function getAllSessions / No such document!');
					ArraySession = null;
				} else {
					ArraySession = doc.data().allSession;
				}
				throw (ArraySession)
			})
			.catch(err => {
				console.log(' Function GETSTEPSINDB /Error getting document', err);
			});
		return ArraySession;
	}

	function getRandomInt(max) {
		console.log("getRandomInt");
		var e = Math.floor(Math.random() * Math.floor(max));
		console.log('getRandomInt : e =>', e);
		return e;
	}

	async function randomSession(){
		console.log("randomSession");
		var allSessions = await getAllSessions();
		var randomInt = getRandomInt(allSessions.length);
		return allSessions[randomInt];
	}

	async function randomExercise(){
		console.log("randomExercise");
		var session = await randomSession();
		var exercises = await getExercises(session);
		console.log('randomExercise : exercises => ',exercises);
		var arrExercises = await setArrayExercise(exercises);
		console.log(arrExercises);
		var randomInt = getRandomInt(arrExercises.length);
		console.log('randomExercise: arrExercises[randomInt] => ',arrExercises[randomInt]);
		return arrExercises[randomInt];
	}
	//Get the array of all the steps of exercise
	//Search in DB
	async function getStepsInDB(exercise, session) {
		console.log('getStepsInDB');
		var sessionRef;
		var e;
		var e2;

		if (session === undefined) {
			return null;
		}
		console.log('session:'+session);
		console.log('exercise:'+exercise);
		sessionRef = admin.firestore().collection('sessions').doc(session);
		await sessionRef.get()
			.then(doc => {
				if (!doc.exists) {
					e = null;
				} else {
					session = doc.data().exercises;
					for (var i = 0; i < session.length; i++) {
						if (session[i].name === exercise) {
							e = session[i].steps;
						}
					}
				}
				throw (e)
			})
			.catch(err => {
				err = null;
				console.log(' Function GETSTEPSINDB /Error getting document', err);
			});
		return e;
	}
	//Return an array with some null and on session Name.
	//the sessionName in the return array is the session where there is the exercise.
	async function createArrayFindSession(exercise, sessionsName) {
		console.log('createArrayFindSession');
		const results = [];
		for (const sessName of sessionsName) {
			// Good: all asynchronous operations are immediately started.
			results.push(findSessionOf(exercise, sessName));
		}
		// Now that all the asynchronous operations are running, here we wait until they all complete.
		return await Promise.all(results);
	}
	//Return the steps of an exercise
	async function getSteps(agent, exercise) {
		console.log('getSteps');
		var arraySession = await getAllSessions();
		console.log('getSteps arraySession =>', arraySession);
		var session;
		var sessions = await createArrayFindSession(exercise, arraySession);

		sessions.forEach((value) => {
			if (value !== undefined) {
				session = value;
			}
		});
		var steps = await getStepsInDB(exercise, session);
		console.log('getSteps ==========>', steps);
		return steps;
	}

	//Function to get a data from DB.
	//type id the type of the value

	async function getDataFromDB(agent, type) {
		console.log('getDataFromDB');
		let userId = getID(agent);
		var e;
		console.log(userId);
		var userRef = admin.firestore().collection('users').doc(userId);
		await userRef.get()
			.then(doc => {
				if (!doc.exists) {
					console.log('Function getDataFromDB / No such document!');
					e = null;
				} else {
					var data = doc.data().ec_data;
					switch (type) {
						case "ex":
							e = data.currentStepEx;
							break;
						case "step":
							e = data.currentStep;
							break;
						case "nameEx":
							e = data.currentExName;
							break;
					}
				}
				throw (e)
			})
			.catch(err => {
				err = null;
				console.log(' Function getDataFromDB', err);
			});
		console.log('getDataBeforeReturn',e);
		return e;
	}
	//Create an array with just the name of the exercise in the session
	function setArrayExercise(session) {
		console.log('setArrayExercise');
		if(session !== null){
			var arrEx = [];
			for (var i = 0; i < session.length; i++) {
				arrEx[i] = session[i].name;
			}
			return arrEx;
		} else return null;
	}

	// mains function

	//Function launch when the user launch ECB_Exercise intent.
	//Says all the step of the exercise (saysAllStep())
	async function startExercise(agent) {
		console.log('startExercise');
		var sentences = jsonContent.startExercise;
		const context = agent.getContext('mycontext');
		var exo = context.parameters.exercise;
		var sent;
		var my_steps = await getSteps(agent, exo);
		if (my_steps === null) {
			sent = parse(sentences.error, exo, await randomExercise(), await randomExercise());
			agent.add(`${sent}`);
			//agent.add(`Sorry, "${exo}" exercise not available. I can advise you these exercises : "${await randomExercise()}" or "${await randomExercise()}".`);
			return;
		}
		else {
			sent = parse(sentences.found, exo, my_steps.length);
			agent.add(`${sent}`);
			//agent.add(`okay, let's do the exercise: ${exo}. There are ${my_steps.length} step(s) in this exercise.`);
			saysAllStep(agent, exo, my_steps, sentences.last);
		}
		saveToDB(agent, 0, 0, exo);
	}
	async function exerciseRepeat(agent){
		console.log('exerciseRepeat');
		const context = agent.getContext('mycontext');
		var sentence = jsonContent.exerciseRepeat;
		var exo = context.parameters.exercise;
		var my_steps = await getSteps(agent, exo);
		agent.add(parse(sentence.intro, exo, my_steps.length));
		//agent.add(`Here are the steps of "${exo}" exercise again. There are ${mySteps.length} step(s) in this exercise.`);
		saysAllStep(agent, exo, my_steps, jsonContent.exerciseEndSentence);
	}
	// If the user wants to get the exercise step by step.
	// Says the first step of the exercise
	async function exerciseSbS(agent){
		console.log('exerciseSbS');
		const context = agent.getContext('mycontext');
		//var exo = context.parameters.exercise;
		var exo = await getDataFromDB(agent, "nameEx");
		var currentStepEx = await getDataFromDB(agent, "ex");
		console.log(exo);
		var my_steps = await getSteps(agent, exo);
		agent.add(parse(jsonContent.saysAllStep.firstStep, exo));
		//agent.add(`So there is the first step of "${exo}" : `);
		agent.add(`${my_steps[0]}`);
		saveToDB(agent, 0, currentStepEx, exo);
	}

	async function stepRepeat(agent){
		var nameEx = await getDataFromDB(agent, "nameEx");
		if (nameEx !== undefined) {
			nameEx = nameEx.toLowerCase();
		}
		var currentStepEx = await getDataFromDB(agent, "ex");
		var exercises = await getSteps(agent, nameEx);
		var stepNumber = await getDataFromDB(agent, "step");
		stepNumber = stepsAdministrator(agent, "repeat", exercises, stepNumber, "step");
	}
	//Function launch when "ECB_Session" is start
	// says all the names of the exercises in the session (SaysAllExercise())
	async function startSession(agent) {
		console.log('startSession');
		saveToDB(agent, 0, 0, "");
		var sent = jsonContent.startSession;
		var session = agent.parameters.sessionType;
		var exs = await getExercises(session.toLowerCase());
		if (exs === null) {
			agent.add(parse(sent.error, session, await randomSession()));
			//agent.add(`"${session}" session not available. I can advise you this session : ${await randomSession()}`);
		} else {
			agent.add(parse(sent.found, exs.length, session));
			//agent.add(`There are ${exs.length} exercise(s) in ${session} session`);
			saysAllExercise(agent,session, setArrayExercise(exs), sent.end);
		}
	}

	async function sessionRepeatAllsession(agent){
		console.log('sessionRepeatAllsession');
		var sent = jsonContent.sessionRepeatAllsession;
		var context = agent.getContext('mycontext');
		var session = context.parameters.sessionType;
		var exs = await getExercises(session.toLowerCase());
		if (exs === null) {
			agent.add(parse(jsonContent.startSession, session, await randomSession()));
			//agent.add(`"${session}" session not available, which session do you want? `);
		}
		else {
			agent.add(parse(sent.intro, session));
			//agent.add(`There are the exercises of "${session}" session again.`);
			saysAllExercise(agent,session, setArrayExercise(exs), sent.end);
		}
	}
	//To go to the next exercise of the session
	//To go the the "exercise {number}"
	async function sessionNext(agent){
		console.log("sessionNext");
		var sent = jsonContent.sessionNext;
		const context = agent.getContext('mycontext');
		var exerciseNumber = agent.parameters.exerciseNumber;
		var currentSess = context.parameters.sessionType;
		var steps;
		if (currentSess !== undefined) {
			currentSess = currentSess.toLowerCase();

		}
		var allSession = await getExercises(currentSess);
		var session = setArrayExercise(allSession);

		if (exerciseNumber === "") {
			exerciseNumber = await getDataFromDB(agent, "ex");

			if(exerciseNumber === session.length - 1) {
				agent.add(jsonContent.sessionEndSentence);
				return;
			}
			exerciseNumber += 1;
			steps = await getStepsInDB(session[exerciseNumber], currentSess);
			//steps = await getSteps(agent, session[exerciseNumber + 1]);
			agent.add(parse(sent.intro,exerciseNumber + 1, session.length));
			agent.add(parse(sent.introSteps,session[exerciseNumber]));
			//agent.add(`You're are at the exercise ${exerciseNumber + 1} of ${session.length}.`);
			//agent.add(`Here are the steps of the exercise "${session[exerciseNumber]}"`);
			saysAllStep(agent, session[exerciseNumber], steps, jsonContent.continueSession);
			saveToDB(agent, 0, exerciseNumber, session[exerciseNumber]);
		} else {
			steps = await getSteps(agent, session[exerciseNumber -1 ]);
			if (exerciseNumber > session.length){
				agent.add(parse(sent.error, exerciseNumber, session.length));
				//agent.add(`Exercise ${exerciseNumber} not available. There is just ${session.length} exercise(s), which exercise you want ?`);
				return
			}
			agent.add(parse(sent.intro,exerciseNumber, session.length));
			agent.add(parse(sent.introSteps,session[exerciseNumber -1]));
			//agent.add(`You're are at the exercise ${exerciseNumber} of ${session.length}.`);
			//agent.add(`Here are the steps of the exercise "${session[exerciseNumber - 1]}"`);
			saysAllStep(agent, session[exerciseNumber - 1], steps, jsonContent.continueSession);
			saveToDB(agent, 0, exerciseNumber - 1, session[exerciseNumber - 1]);
			//return saveToDB(agent, 0, exerciseNumber, session[exerciseNumber - 1]);
		}
	}
	//To go the the previous exercise of the session
	async function sessionPrevious(agent){
		console.log("sessionPrevious");
		const context = agent.getContext('mycontext');
		var currentSess = context.parameters.sessionType;
		var sent = jsonContent.sessionPrevious;
		var steps;
		if (currentSess !== undefined) {
			currentSess = currentSess.toLowerCase();
		}
		var allSession = await getExercises(currentSess);
		var session = setArrayExercise(allSession);
		var exerciseNumber = await getDataFromDB(agent, "ex");
		if(exerciseNumber === 0) {
			agent.add(parse(sent.error));
			//agent.add(`You're already at the beggining of the session.`)
			return;
		}
		exerciseNumber -=1;
		steps = await getStepsInDB(session[exerciseNumber], currentSess);
		agent.add(parse(sent.intro, session[exerciseNumber]));
		//agent.add(`We're back to ${session[exerciseNumber]} exercise.`);
		saysAllStep(agent, session[exerciseNumber], steps, jsonContent.continueSession);
		saveToDB(agent, 0, exerciseNumber, session[exerciseNumber]);

	}
	//To repeat the current exercise
	async function sessionRepeat(agent){
		console.log("sessionRepeat");
		const context = agent.getContext('mycontext');
		var currentSess = context.parameters.sessionType;
		var steps;
		if (currentSess !== undefined) {
			currentSess = currentSess.toLowerCase();
		}
		var allSession = await getExercises(currentSess);
		var session = setArrayExercise(allSession);
		var exerciseNumber = await getDataFromDB(agent, "ex");
		steps = await getStepsInDB(session[exerciseNumber], currentSess);
		agent.add(parse(jsonContent.sessionRepeat.intro, session[exerciseNumber]));
		//agent.add(`No problem. I tell you ${session[exerciseNumber]}'s steps again.`);
		saysAllStep(agent, session[exerciseNumber], steps, jsonContent.continueSession);
	}
	// Says all the steps of an exercise
	async function saysAllStep(agent, nameEx, exercises, lastSentence){
			console.log('saysAllStep');
			var sentences = jsonContent.saysAllStep.steps;
			console.log(sentences);
			var i = 1;
			var sent;
			//var currentStepEx = await getDataFromDB(agent, "ex");
			//agent.add(`${nameEx} : `);
			exercises.forEach((value) => {
				sent = parse(sentences, i, value);
				agent.add(`${sent}`);
				i++;
			});
			agent.add(lastSentence);
			//return saveToDB(agent, 0 , currentStepEx, nameEx);
	}
	//Says all the exercise of a session
	async function saysAllExercise(agent,sessionName, sessions, sentenceEnd){
		console.log('saysAllExercise');
		var currentStepEx = 0;
		var sentences = jsonContent.saysAllExercise;
		var i = 1;
		sessions.forEach((value) => {
			var sent = parse(sentences.exercises, i, value);
			agent.add(`${sent}`);
			i++
		});
		agent.add(sentenceEnd);
	}
	//"ECX_Steps" intent.
	async function steps(agent) {
		console.log('steps');
		const context = agent.getContext('mycontext');
		var session = context.parameters.sessionType;
		var next = agent.parameters.isNext;
		var stepNumber = agent.parameters.step;
		var currentEx = context.parameters.exercise;
		if (currentEx !== undefined) {
			//currentEx = currentEx.toLowerCase();
		}
		var nameEx = await getDataFromDB(agent, "nameEx");
		if (nameEx !== undefined) {
			console.log('steps : nameEx =>', nameEx);
			//nameEx = nameEx.toLowerCase();
		}
		var currentStepEx = await getDataFromDB(agent, "ex");
		var exercises = await getSteps(agent, currentEx);
		if (stepNumber === "") {
			stepNumber = await getDataFromDB(agent, "step");
			console.log("stepNumber:"+stepNumber);
			switch (nameEx) {
				case "":
					stepNumber = stepsAdministrator(agent, next.toLowerCase(), exercises, stepNumber, "step");
					return saveToDB(agent, stepNumber, currentStepEx, currentEx);
				default:
					exercises = await getSteps(agent, nameEx);
					stepNumber = stepsAdministrator(agent, next.toLowerCase(), exercises, stepNumber, "step");
					return saveToDB(agent, stepNumber, currentStepEx, nameEx);
			}
		} else {
			stepNumber = await getDataFromDB(agent, "step");
			switch (nameEx) {
				case "":
					console.log('currentEx:'+currentEx);
					exercises = await getSteps(agent, currentEx);
					stepNumber = stepsAdministrator(agent, next, exercises, stepNumber, "step");
					return saveToDB(agent, stepNumber, currentStepEx, currentEx);
				default:
					console.log('nameEx:'+nameEx);
					console.log('stepNumber:'+stepNumber);
					exercises = await getSteps(agent, nameEx);
					console.log('steps:'+exercises);
					stepNumber = stepsAdministrator(agent, next, exercises, stepNumber, "step");
					return saveToDB(agent, stepNumber, currentStepEx, nameEx);
			}
		}
	}
	//Administrator for the step of an exercise
	//Go to the the exercise Number "stepNumber"
	//Or go the the "next", next can take null, "next", "previous" or "repeat" value.
	function stepsAdministrator(agent, next, exercises, stepNumber) {
		console.log('stepsAdministrator');
		var sentencesSA = jsonContent.stepsAdministrator;
		var sentSteps = jsonContent.saysAllStep.steps;
		var e;
		if (next !== "") {
			switch (next) {
				case "next":
					stepNumber += 1;
					console.log('step admin:'+stepNumber);
					console.log('Excercises:'+exercises);
					if (stepNumber <= exercises.length - 1) {
						agent.add(`${parse(sentSteps, stepNumber + 1, exercises[stepNumber])}`);
						//saysStep(agent, stepNumber, exercises);
						return stepNumber;
					} else {
						agent.add(sentencesSA.endEx);
						return stepNumber -1;
					}
				case "previous":
					if (stepNumber <= 0) {
						agent.add(sentencesSA.atBegin);
					} else {
						stepNumber -= 1;

						agent.add(`${parse(sentSteps, stepNumber + 1, exercises[stepNumber])}`);
						return stepNumber;
					}
					break;
				case "repeat":

					agent.add(`${parse(sentSteps, stepNumber + 1, exercises[stepNumber])}`);
					return stepNumber;
				default:
					agent.add(sentencesSA.error);
			}
		} else if (stepNumber >= exercises.length || stepNumber < 1) {
			e = parse(sentencesSA.errorStep, stepNumber, exercises.length);
			agent.add(e);
		} else {

			agent.add(`${parse(sentSteps, stepNumber - 1, exercises[stepNumber])}`);
			//saysStep(agent, stepNumber - 1, exercises);
			return stepNumber;
		}
		return stepNumber;
	}

	function saysStep(agent, stepNumber, steps){
		agent.add(`Step ${stepNumber + 1} : ${steps[stepNumber]}`);
	}
	//"ECB_cals"
	//Give calories
	async function calories(agent) {
		console.log('calories');
		const context = agent.getContext('mycontext');
		var session = context.parameters.sessionType;
		if (session === "") {
			agent.add(`Begin a session to know how many calories burned`);
		} else {
			var weight = agent.parameters.CalsWeight;
			console.log('calories => weight : ', weight);
			var time = agent.parameters.CalsTime;
			var met = await getMet(session);
			if (met === null) {
				agent.add(`Sorry, calories burned for ${session} session not available.`);
			} else {
				var cals = met * 3.5 * weight / 200 * time;
				agent.add(`Congratulations ! You have burned ${cals} calories ! `);
			}
		}
	}
	//NOT USE
	async function verifUserId(userId) {
		console.log('verifUserId');
		var errors = "Error verifUserId"
		var bool;
		await admin.firestore().collection('users').where('userId', '==', userId).limit(1).get()
			.then(snapshot => {
				let user = snapshot.docs[0]
				if (!user) {
					bool = true;
				} else {
					bool = false;
				}
				return bool;

			})
			.catch(errors);
		return bool;
	}
	// "ECB_session - yes"
	//Give the first exercise of the current session
	async function sessionFromBegin(agent) {
		console.log('sessionFromBegin');
		const context = agent.getContext('mycontext');
		var exerciseNumber = 0;
		var currentSess = context.parameters.sessionType;
		currentSess = currentSess.toLowerCase();
		var allSession = await getExercises(currentSess);
		var session = setArrayExercise(allSession);
		var steps = await getStepsInDB(session[0], currentSess);
		agent.add(parse(jsonContent.sessionFromBegin.intro, session[0], steps.length));
		//agent.add(`Let's begin with ${session[0]} exercise. There is ${steps.length} steps.`);
		saysAllStep(agent, session[0], steps, jsonContent.continueSession);
		saveToDB(agent, 0, exerciseNumber, session[exerciseNumber]);
	}

	//"ECB_exercise - yes"
	async function exerciseFromBegin(agent) {
		console.log('exerciseFromBegin');
		const context = agent.getContext('mycontext');
		var stepNumber = 1
		var currentEx = context.parameters.exercise;
		if (currentEx !== undefined) {
			//currentEx = currentEx.toLowerCase();
		}
		var nameEx = await getDataFromDB(agent, "nameEx");
		if (nameEx !== undefined) {
			console.log('sessionFromBegin : nameEx =>', nameEx);
			//nameEx = nameEx.toLowerCase();
		}
		var currentStepEx = await getDataFromDB(agent, "ex");
		var exercises = await getSteps(agent, currentEx);
		switch (nameEx) {
			case "":
				agent.add(parse(jsonContent.exercise, stepNumber, exercises.length, exercises[stepNumber - 1]));
				//agent.add(`${type} number ${stepNumber} on ${exercises.length} : ${exercises[stepNumber - 1]}`);
				return saveToDB(agent, stepNumber, currentStepEx, currentEx);
			default:
				exercises = await getSteps(agent, nameEx);
				agent.add(parse(jsonContent.exercise, stepNumber, exercises.length, exercises[stepNumber - 1]))
				//agent.add(`${type} number ${stepNumber} on ${exercises.length} : ${exercises[stepNumber - 1]}`);
				return saveToDB(agent, stepNumber, currentStepEx, nameEx);
		}
	}
	//When the user says ok, go the the next step
	async function exerciseOk(agent) {
		console.log('exerciseOk');
		const context = agent.getContext('mycontext');
		var session = context.parameters.sessionType;
		var next = "next";
		var currentEx = context.parameters.exercise;
		if (currentEx !== undefined) {
			//currentEx = currentEx.toLowerCase();
		}
		var nameEx = await getDataFromDB(agent, "nameEx");
		if (nameEx !== undefined) {
			//nameEx = nameEx.toLowerCase();
		}
		var currentStepEx = await getDataFromDB(agent, "ex");
		var exercises = await getSteps(agent, currentEx);
		var stepNumber = await getDataFromDB(agent, "step");
		switch (nameEx) {
			case "":
				stepNumber = stepsAdministrator(agent, next.toLowerCase(), exercises, stepNumber, "step");
				return saveToDB(agent, stepNumber, currentStepEx, currentEx);
			default:
				exercises = await getSteps(agent, nameEx);
				stepNumber = stepsAdministrator(agent, next.toLowerCase(), exercises, stepNumber, "step");
				return saveToDB(agent, stepNumber, currentStepEx, nameEx);
		}
	}
	//Bot says the tutorial
	function tutorial(agent) {
		agent.add('What would you like to do? "Start session" or "Start exercise?".');
		agent.add('To proceed to the next exercise, say "next exercise" or the exercise number: "Exercise 3".');
		agent.add('To get the step of the current exercise, tell me "step by step". and then : "first step", "step 1", or "next step".');
		agent.add('Tell me "cancel" to cancel the current action');
	}

	function sleep(milliseconds) {
	  var start = new Date().getTime();
	  for (var i = 0; i < 1e7; i++) {
	    	if ((new Date().getTime() - start) > milliseconds){
	     		 break;
	    	}
 		}
	}

	function sleep(milliseconds) {
	  var start = new Date().getTime();
	  for (var i = 0; i < 1e7; i++) {
	    	if ((new Date().getTime() - start) > milliseconds){
	     		 break;
	    	}
 		}
	}

	async function saysAllExercise(agent,sessionName, sessions){
		console.log('saysAllExercise');
		var currentStepEx = 0;
		var i = 1;
		agent.add(`${sessionName} =>`);
		sessions.forEach((value) => {
			agent.add(`exercise ${i} : ${value}`);
			console.log('saysAllExercise - value =>', value);
			i++
		});
		agent.add('Are you ready to start session?');
	}

	function googleAssistantHandler(agent) {
		let conv = agent.conv(); // Get Actions on Google library conv instance
		conv.ask('Hello from the Actions on Google client library!'); // Use Actions on Google library
		agent.add(conv); // Add Actions on Google library responses to your agent's response
	}

	async function getData(agent, type, subtype) {
		console.log('getData');
		let userId = getID(agent);
		var e;
		var userRef = admin.firestore().collection('users').doc(userId);
		await userRef.get()
			.then(doc => {
				if (!doc.exists) {
					console.log('Function getDataFromDB / No such document!');
					e = null;
				} else {
					var data = doc.data();
					switch (type) {
						case "name":
							e = data.name;
							break;
						case "age":
							e = data.age;
							break;
						case "weight":
							e = data.weight;
							break;
						case "height":
							e = data.height;
							break;
						case "calendar":
							var temp1 = data.week_calendar;
							console.log(temp1);
							var day = subtype;//new Date().getDay();

							console.log('day:' + day);
							switch (day) {
								case 1:
									e = temp1['mon'];
									break;
								case 2:
									e = temp1['tue'];
									break;
								case 3:
									e = temp1['wed'];
									break;
								case 4:
									e = temp1['thu'];
									break;
								case 5:
									e = temp1['fri'];
									break;
								case 6:
									e = temp1['sat'];
									break;
								case 0:
									e = temp1['sun'];
									break;
							}
							break;
						case "ec_data":
							var temp = data.ec_data;
							switch (subtype) {
								case "ex":
									e = temp.curretExName;
									break;
								case "ex_step":
									e = temp.currentStepEx;
									break;
								case "step":
									e = temp.curretStep;
									break;
							}
							break;
						case "fur_data":
							var temp = data.fur_data;
							switch (subtype) {
								case "currentActivity":
									e = temp.currentActivity;
									break;
							}
							break;
						case "NoActivityReason":
							e = data.NoActivityReason;
							break;
						case "ActivityLog":
							e = data.ActivityLog;
							break;
						case "Steps":
							e = data.stepArray;
							break;
					}
				} throw (e)
			})
			.catch(err => {
				console.log(' Function getData getting document', err);
			});
		console.log('Function getData before return:', e);
		return e;
	}

	async function getMessageData(type) {
		console.log('getMessageData');
		var e;
		var userRef = admin.firestore().collection('messages').doc('pa');
		await userRef.get()
			.then(doc => {
				if (!doc.exists) {
					console.log('Function getMessageData / No such document!');
					e = null;
				} else {
					var data = doc.data();
					console.log(data);
					switch (type) {
						case 'positive':
							e = data.positive;
							break;
						case 'negative':
							e = data.negative;
							break;
					}
				} throw (e)
			})
			.catch(err => {
				console.log(' Function getData getting document', err);
			});
		console.log('Function getData before return:', e);
		return e;
	}

	async function getEndMessageData(type) {
		console.log('getEndMessageData');
		var e;
		var userRef = admin.firestore().collection('messages').doc('convo');
		await userRef.get()
			.then(doc => {
				if (!doc.exists) {
					console.log('Function getEndMessageData / No such document!');
					e = null;
				} else {
					var data = doc.data();
					switch (type) {
						case 'end':
							e = data.end;
							break;
						case 'beginning':
							e = data.beginning;
							break;
					}
				} throw (e)
			})
			.catch(err => {
				console.log(' Function getEndMessageData getting document', err);
			});
		console.log('Function getEndMessageData before return:', e);
		return e;
	}

	async function getMessage(type){
		var all_data = await getMessageData(type);
		console.log(all_data);
		var index = Math.floor(Math.random() * all_data.length);
		console.log(index);
		console.log(all_data[index]);
		return all_data[index];
	}

	async function getEndMessage(type){
		var all_data = await getEndMessageData(type);
		console.log(all_data);
		var index = Math.floor(Math.random() * all_data.length);
		console.log(index);
		console.log(all_data[index]);
		return all_data[index];
	}

	//Personalisation Intents
	function startPersonalisation(agent) {
		agent.add(`Let's start with some introductions. Hello, I am FitChat. What is your name?`);

	}

	function getUserName(agent) {
		const name = agent.parameters['given-name'];
		const gotName = name.length > 0;

		if (gotName) {
			saveNameToDB(agent, name);
			agent.add(`Hello ${name}, I can help you to be more physically active.
				For the best experience I need to ask you a few questions. Would you like me to continue?`);

		} else {
			agent.add(`I'm sorry, can you give me your name again?`);
		}
	}

	function saveNameToDB(agent, name) {
		let userID = getID(agent);
		console.log("UserID = "+userID);
		console.log("Name: "+name);
		var errors = "Error saveNameToDB";
		var docRef = admin.firestore().collection('users').doc(userID);
			docRef.get().then(function(doc) {
				if (doc.exists) {
					console.log('saveAgeToDB => USER ID MATCHED');
					var usersRef = admin.firestore().collection('users');
					var setSf = usersRef.doc(userID).update({
						name: name
					});
					return null;
				}
				else {
					console.log('saveNameToDB => USER NOT IN DB');
				}
				return null;
			})
			.catch(errors);
	}

	function getUserAge(agent) {
		const age = agent.parameters['age'];
		const gotAge = age !== undefined;

		if (gotAge) {
			saveAgeToDB(agent, age);
			agent.add(`Thank you, and what is your gender?`);
		} else {
			agent.add(`I'm sorry, can you give me your age again?`);
		}
	}

	function saveAgeToDB(agent, age) {
		let userID = getID(agent);
		console.log("UserID = "+userID);
		console.log("Age: "+age);
		var errors = "Error saveAgeToDB";
		var docRef = admin.firestore().collection('users').doc(userID);
			docRef.get().then(function(doc) {
				if (doc.exists) {
					console.log('saveAgeToDB => USER ID MATCHED');
					var usersRef = admin.firestore().collection('users');
					var setSf = usersRef.doc(userID).update({
						age: age
					});
					return null;
				}
				else {
					console.log('saveAgeToDB => USER NOT IN DB');
				}
				return null;
			})
			.catch(errors);
	}

	function getUserGender(agent) {
		const gender = agent.parameters['gender'];
		const gotGender = gender.length>0;

		if (gotGender) {
			saveGenderToDB(agent, gender);
			agent.add(`Thank you, and how tall are you?`);
		} else {
			agent.add(`I'm sorry, can you repeat that?`);
		}
	}

	function saveGenderToDB(agent, gender) {
		let userID = getID(agent);
		console.log("UserID = "+userID);
		console.log("Gender: "+gender);
		var errors = "Error saveGenderToDB";
		var docRef = admin.firestore().collection('users').doc(userID);
			docRef.get().then(function(doc) {
				if (doc.exists) {
					console.log('saveGenderToDB => USER ID MATCHED');
					var usersRef = admin.firestore().collection('users');
					var setSf = usersRef.doc(userID).update({
						gender: gender
					});
					return null;
				}
				else {
					console.log('saveGenderToDB => USER NOT IN DB');
				}
				return null;
			})
			.catch(errors);
	}

	function getUserHeight(agent) {
		const height = agent.parameters['height'];
		const gotHeight = height !== undefined;

		if (gotHeight) {
			saveHeightToDB(agent, height);
			agent.add(`Thank you, and how much do you weigh?`);
		} else {
			agent.add(`I'm sorry, can you repeat that?`);
		}
	}

	function saveHeightToDB(agent, height) {
		let userID = getID(agent);
		console.log("UserID = "+userID);
		console.log("Height: "+height);
		var errors = "Error saveHeightToDB";
		var docRef = admin.firestore().collection('users').doc(userID);
			docRef.get().then(function(doc) {
				if (doc.exists) {
					console.log('saveHeightToDB => USER ID MATCHED');
					var usersRef = admin.firestore().collection('users');
					var setSf = usersRef.doc(userID).update({
						height: height
					});
					return null;
				}
				else {
					console.log('saveHeightToDB => USER NOT IN DB');
				}
				return null;
			})
			.catch(errors);
	}

	async function getUserWeight(agent) {
		const weight = agent.parameters['weight'];
		const gotWeight = weight !== undefined;

		let location = await getData(agent, "location", "");
		console.log("Location from DB: " +location);

		if (gotWeight) {
			saveWeightToDB(agent, weight);
			//agent.add(`Thank you. My GPS shows me that you are in ${location}, is that right?`);
			agent.add(`Thank you. What is your location?`);
		} else {
			agent.add(`I'm sorry, can you repeat that?`);
		}
	}

	function saveWeightToDB(agent, weight) {
		let userID = getID(agent);
		console.log("UserID = "+userID);
		console.log("Weight: "+weight);
		var errors = "Error saveWeightToDB";
		var docRef = admin.firestore().collection('users').doc(userID);
			docRef.get().then(function(doc) {
				if (doc.exists) {
					console.log('saveWeightToDB => USER ID MATCHED');
					var usersRef = admin.firestore().collection('users');
					var setSf = usersRef.doc(userID).update({
						weight: weight
					});
					return null;
				}
				else {
					console.log('saveWeightToDB => USER NOT IN DB');
				}
				return null;
			})
			.catch(errors);
	}

	async function location(agent) {
		const locationJSON = agent.parameters['location'];
		const location = locationJSON.city;
		const gotLocation = location.length>0;

		if (gotLocation) {
			updateLocation(agent, location);
			var output = `Okay, your location has been saved as ${location}. Thank you.`
			output += ` `;
			output += `Current Word Health Organisation guidelines for older adults suggest 150 minutes per week of moderate intensity physical activity`;
			output += ` `;
			output += `Can i ask how many minutes of moderate intensity physical activity do you currently within a week?`;
			agent.add(output);
		} else {
			agent.add(`I'm sorry, can you repeat that?`);
		}
	}

	function paGuideline(agent) {
		var output = `Okay!`
		output += ` `;
		output += `WHO also recommend muscle strengthening activity at least twice per week`;
		output += ` `;
		output += `Can I ask how times do you do muscle strengthening activities within a week?`;
		agent.add(output);
	}

	async function exGuideline(agent) {
		var name = await getData(agent, "name", "");
		var output = `Okay!`
		output += ` `;
		output += `Thanks ${name}, I will use these information to personalise myself for you.`;
		agent.add(output);
	}


	function updateLocation(agent, location) {
		let userID = getID(agent);
		console.log("UserID = "+userID);
		console.log("Location: "+location);
		var errors = "Error updateLocation";
		var docRef = admin.firestore().collection('users').doc(userID);
			docRef.get().then(function(doc) {
				if (doc.exists) {
					console.log('updateLocation => USER ID MATCHED');
					var usersRef = admin.firestore().collection('users');
					var setSf = usersRef.doc(userID).update({
						location: location
					});
					return null;
				}
				else {
					console.log('updateLocation => USER NOT IN DB');
				}
				return null;
			})
			.catch(errors);
	}

	//Follow-Up Reporting Intents
	async function saveCurrentActivity(agent, activity){
		let userID = getID(agent);
		var errors = "Error saveCurrentActivity";
		var docRef = admin.firestore().collection('users').doc(userID);
	    docRef.get().then(function(doc) {
	      	if (doc.exists) {
				var usersRef = admin.firestore().collection('users');
				var setSf = usersRef.doc(userID).update({
					fur_data: {
						currentActivity: activity
					}
				});
				return null;
			}
			else {
				console.log('saveCurrentActivity => USER NOT IN DB');
			}
			return null;
		}).catch(errors);
	}

	async function followupReporting(agent) {
		name = await getData(agent, "name", "");
		var temp = await getData(agent, "calendar", new Date().getDay());
		fp_today_activities = temp.map(function(e) {
			return e['activity'].toLowerCase();
		  });
		console.log(fp_today_activities);
		if (fp_today_activities === undefined || fp_today_activities.length === 0) {
			saveCurrentActivity(agent, "");
			agent.add(`Hello ${name}, Did you do a physical activity today?`);
		}
		else {
			current_activity = fp_today_activities[0]
			saveCurrentActivity(agent, current_activity);
			/*agent.setContext({
				'name':'userid',
				'lifespan': 13,
				'parameters':{
				  'Activities':current_activity
				  }
			  });
			*/
			agent.add(`Hello ${name}, Did you do ${current_activity} today?`);
		}
	}

	function isEmpty(_input){
		if (_input === undefined || _input === ''){
			return true;
		}
		return false;
	}

	async function saveActivityLog(agent, activity, duration){
		let userID = getID(agent);
		var errors = "Error saveActivityLog";
		let al_data = await getData(agent, "ActivityLog", "");
		var docRef = admin.firestore().collection('users').doc(userID);
	    docRef.get().then(function(doc) {
	      	if (doc.exists) {
				var usersRef = admin.firestore().collection('users');
				var date = new Date();
				var dura = JSON.stringify(duration);
				console.log(dura);
				dura = JSON.parse(dura);
				var new_data = {'activity' : activity, 'duration' : dura.duration.amount+' '+dura.duration.unit, 'timestamp' : date.toString()}
				al_data.push(new_data);
				var setSf = usersRef.doc(userID).update({
					ActivityLog :
					al_data
				});
				return null;
			}
			else {
				console.log('saveActivityLog => USER NOT IN DB');
			}
			return null;
		}).catch(errors);
	}

	async function followupReportingYesNo(agent){
		var output = `Wonderful!`;
		output += ` `;
		output += await getMessage('positive');
		output += ` `;
		output += await getEndMessage('end');
		agent.add(output);
	}

	async function followupReportingYes(agent) {
		console.log('followupReportingYes');
		const context = agent.getContext('userid');
		var activity = context.parameters.Activities;
		var duration  = context.parameters.TimePeriods;
		if (!isEmpty(activity) && !isEmpty(duration)){
			//add a message from message bank for encouragement
			saveActivityLog(agent, activity, duration);
			var output = `Wonderful! I have recorded ${activity} for you!`;
			saveCurrentActivity(agent, "");
			agent.setContext({
				'name':'userid',
				'lifespan': 15,
				'parameters':{
				  'Activities':'',
				  'TimePeriods':''
				  }
			  });
			output += ' Did you do any other activity today?';
			agent.add(output);
		}
		else if (!isEmpty(activity) && isEmpty(duration)){
			agent.add(`How long did you do ${activity} for?`);
		}
		else if (isEmpty(activity) && !isEmpty(duration)){
			const current_activity = await getData(agent, "fur_data", "currentActivity");
			if (isEmpty(current_activity)){
				agent.add('Tell me an activity you did today?');
			}
			else{
				saveActivityLog(agent, current_activity, duration);
				var output = `Wonderful! I have recorded ${current_activity} for you!`;
				saveCurrentActivity(agent, "");
				agent.setContext({
					'name':'userid',
					'lifespan': 15,
					'parameters':{
					'Activities':'',
					'TimePeriods':''
					}
				});
				output += ' Did you do any other activity today?';
				agent.add(output);
			}
		}
		else {
			const current_activity = await getData(agent, "fur_data", "currentActivity");
			if (isEmpty(current_activity)){
				agent.add('Tell me an activity you did today?');
			}
			else{
				agent.add(`How long did you do ${current_activity} for?`);
			}
		}
	}


	async function followupReportingNo(agent) {
		var reason = agent.parameters['NoActivityReasons'];
		var output = ``;
		if (isEmpty(reason)){
			output += `Would you like to tell me a reason for my records?`;
		}
		else{
			name = await getData(agent, "name", "");
			var reason = agent.parameters['NoActivityReasons'];
			saveNoActivityReason(agent, reason);
			//place to add barrier specific messages
			output += `Thank you ${name}, I will keep a record of that`;
			output += ` `;
			output += await getMessage('negative');
			output += ` `;
			output += await getEndMessage('end');
		}
		agent.add(output);
	}

	async function followupReportingNoNone(agent) {
		name = await getData(agent, "name", "");
		var output = `That's fine ${name}, Let's try to do better tomorrow.`;
		output += ` `;
		output += await getMessage('negative');
		output += ` `;
		output += await getEndMessage('end');
		agent.add(output);
	}

	async function saveNoActivityReason(agent, reason) {
		let userID = getID(agent);
		var errors = "Error saveNoActivityReason"
		let nar_data = await getData(agent, "NoActivityReason", "");
		var docRef = admin.firestore().collection('users').doc(userID);
	    docRef.get().then(function(doc) {
	      	if (doc.exists) {
				var usersRef = admin.firestore().collection('users');
				var date = new Date();
				var new_data = {'reason' : reason, 'timestamp' : date.toString()}
				//nar_data = JSON.stringify(nar_data);
				//console.log(nar_data)
				//nar_data = JSON.parse(nar_data);
				nar_data.push(new_data);
				var setSf = usersRef.doc(userID).update({
					NoActivityReason :
					nar_data
				});
				return null;
			}
			else {
				console.log('saveActivityToDB => USER NOT IN DB');
			}
			return null;
		}).catch(errors);
	}

	async function followupReportingNoReason(agent) {
		name = await getData(agent, "name", "");
		var reason = agent.parameters['NoActivityReasons'];
		saveNoActivityReason(agent, reason);
		//place to add barrier specific messages
		var output = `Thank you ${name}, I will keep a record of that. `;
		output += await getMessage('negative');
		agent.add(output);
	}

	function filter(data, steps, name){
		var out = `Hello ${name} `;
		var weekday = new Array(7);
	      weekday[0] =  "Sunday";
	      weekday[1] = "Monday";
	      weekday[2] = "Tuesday";
	      weekday[3] = "Wednesday";
	      weekday[4] = "Thursday";
	      weekday[5] = "Friday";
		  weekday[6] = "Saturday";
		var oneWeekAgo = new Date();
		oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
		let stepCount = 0;
		let daysCount = 0;
		var y;
		for (y in steps){
			var date = new Date(steps[y]["date"]);
			if (date > oneWeekAgo){
				daysCount = daysCount + 1;
				stepCount = stepCount + steps[y]["value"];
			}
		}
		if(daysCount > 0){
			const average = parseInt(stepCount/daysCount, 10);
			if (average > 0){
				out += ` You did ${average} steps in average during last week!`;
			}
		}
		var z;
		var count = 0;
		for (z in data){
			var date = new Date(data[z]["timestamp"]);
			if (date > oneWeekAgo){
				count = count + 1;
			}
		}
		if (count > 0){
			var x;
			if (count == 1){
				out += ` You did ${count} activity during last week.`;
			}
			else{
				out += ` You did ${count} activities during last week.`;
			}
			for (x in data){
				var date = new Date(data[x]["timestamp"]);
				if (date > oneWeekAgo){
					var name = data[x]["activity"];
					out += `\n${name} on ${weekday[date.getDay()]}`;
				}
			}
		}
		return out;
	}

	async function summary(agent){
		var name = await getData(agent, "name", "");
		var data = await getData(agent, "ActivityLog");
		data = JSON.stringify(data);
		data = JSON.parse(data);
		var steps = await getData(agent, "Steps");
		steps = JSON.stringify(steps);
		steps = JSON.parse(steps);
		var output = filter(data, steps, name);
		output += `\n`;
		output += await getMessage('positive');
		output += ` `;
		output += await getEndMessage('end');
		agent.add(output);
	}

	//Goal Setting Intents
	function goalSetting(agent) {
		agent.add(`Let's set a goal for this week! Would you prefer to set an activity goal, or a steps goal?`);
	}

	function stepsGoal(agent) {
		agent.add(`Great! 2000 steps is approximately 1 mile, and 1250 steps is approximately 1 kilometre.
				How many steps are you planning to complete each day?`);

	}

	async function numberOfSteps(agent) {
		const target = agent.parameters['number'];
		const gotTarget = target > 0;

		if (gotTarget) {
			saveStepsToDB(agent, target);
			name = await getData(agent, "name", "");
			agent.add(`Great ${name}, your target is ${target} steps per day. You can use the Traxivity tab to check your progress`);
			agent.add(`Don't forget to carry your phone as much as possible, so I can track your steps`);
			agent.add(await getEndMessage('end'));
		}
		else {
			agent.add(`Sorry, I didn't get that. Can you tell me how many steps you want to do per day again?`);
		}
	}

	async function noSteps(agent) {
		agent.add(`That's ok! Let's try to fit in some walking during the week as we get time.
		You can see your progress in the Traxivity tab.`);
		agent.add(`Don't forget to carry your phone as much as possible, so I can track your steps.`);
		agent.add(await getEndMessage('end'));
	}

	function saveStepsToDB(agent, target) {
		let userID = getID(agent);
		console.log("UserID = "+userID);
		console.log("Target: "+target);
		var errors = "Error saveStepsToDB";
		var docRef = admin.firestore().collection('users').doc(userID);
			docRef.get().then(function(doc) {
				if (doc.exists) {
					console.log('saveStepsToDB => USER ID MATCHED');
					var usersRef = admin.firestore().collection('users');
					var setSf = usersRef.doc(userID).update({
						dailyStepGoal: target
					});
					return null;
				}
				else {
					console.log('saveStepsToDB => USER NOT IN DB');
				}
				return null;
			})
			.catch(errors);
	}

//Activities Goal Setting
	function activityGoal(agent) {
		agent.add(`Great, what physical activities do you have planned for this week?`);
	}

	async function setActivities(agent) {
		var activities = agent.parameters['ActivitySchedule'];
	  var weekday = new Array(7);
	      weekday[0] =  "Sunday";
	      weekday[1] = "Monday";
	      weekday[2] = "Tuesday";
	      weekday[3] = "Wednesday";
	      weekday[4] = "Thursday";
	      weekday[5] = "Friday";
	      weekday[6] = "Saturday";

	  if(activities.length > 0)
	  {
	    var output = `Okay, so that's `;
	    //One activity, One day
	    for (var i = 0; i < activities.length; i++) {
	      if (activities[i].activity !== undefined && activities[i].date !== undefined) {
	        console.log("One Activity, One Day");
	        const d = activities[i].date;
	        const date = new Date(d);
	        const day = weekday[date.getDay()];
	        const dbDay = day.substring(0,3).toLowerCase();
	        const activity = activities[i].activity;
	        var time = null;
	        var dbTime = null;
	        var datetime = null;

	        if (activities[i].time !== undefined) {
	          const t = activities[i].time;
	          const timeFormat = new Date(t);
	          datetime = new Date(date.getFullYear(), date.getMonth(), date.getDate(),
	                        timeFormat.getHours(), timeFormat.getMinutes(), timeFormat.getSeconds());
	          dbTime = datetime;
	          time = timeFormat.toLocaleTimeString('en-gb',
	          { timeZone: 'Europe/London', hour: 'numeric', minute: 'numeric', hour12: true });
	        }

	        if (i + 1 === activities.length && activities.length > 1) {
	          output += ` and `;
	        }

	        output += `${activity} on ${day}`;
	        if (time !== null) {
	          output += ` at ${time}`;
	        }

	        //Add activity to database
	        if(time !== null){
	          console.log("Saving to DB - Time");
	          saveActivityToDBTime(agent, activity, dbDay, dbTime);
	        }
	        else if(date !== null){
	          console.log("Saving to DB - Date");
	          saveActivityToDB(agent, activity, dbDay);
	        }
	      }
	      //One activity, Two days
	      else if(activities[i].activity !== undefined && activities[i].date1 !== undefined) {
					console.log("One Activity, Two days");
					const d1 = activities[i].date1;
	        const date1 = new Date(d1);
	        const d2 = activities[i].date2;
	        const date2 = new Date(d2);
	        const day1 = weekday[date1.getDay()];
	        const day2 = weekday[date2.getDay()];
	        const dbDay1 = day1.substring(0,3).toLowerCase();
	        const dbDay2 = day2.substring(0,3).toLowerCase();
	        const activity = activities[i].activity;
	        var time = null;
	        var time1 = null;
	        var time2 = null;
	        var dbTime1 = null;
	        var dbTime2 = null;

	        if (activities[i].time !== undefined) {
	          const t = activities[i].time;
	          const timeFormat = new Date(t);
	          var datetime1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate(),
	                        timeFormat.getHours(), timeFormat.getMinutes(), timeFormat.getSeconds());
						var datetime2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate(),
	                        timeFormat.getHours(), timeFormat.getMinutes(), timeFormat.getSeconds());
	          dbTime1 = datetime1;
						dbTime2 = datetime2;
	          time = timeFormat.toLocaleTimeString('en-gb',
	          { timeZone: 'Europe/London', hour: 'numeric', minute: 'numeric', hour12: true });
	        }
	        else if(activities[i].time1 !== undefined){
	          const t1 = activities[i].time1;
	          const t2 = activities[i].time2;
	          const timeFormat1 = new Date(t1);
	          const timeFormat2 = new Date(t2);
	          var datetime1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate(),
	                        timeFormat1.getHours(), timeFormat1.getMinutes(), timeFormat1.getSeconds());
	          var datetime2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate(),
	                        timeFormat2.getHours(), timeFormat2.getMinutes(), timeFormat2.getSeconds());

	          dbTime1 = datetime1;
	          dbTime2 = datetime2;
	          time1 = timeFormat1.toLocaleTimeString('en-gb',
	          { timeZone: 'Europe/London', hour: 'numeric', minute: 'numeric', hour12: true });
	          time2 = timeFormat2.toLocaleTimeString('en-gb',
	          { timeZone: 'Europe/London', hour: 'numeric', minute: 'numeric', hour12: true });
	        }

	        if (i + 1 === activities.length && activities.length > 1) {
	          output += ` and `;
	        }

	        output += `${activity} on ${day1}`;
	        if (time1 !== time2) {
	          output += ` at ${time1}`;
	        }
	        output += ` and on ${day2}`
	        if (time2 !== null) {
	          output += ` at ${time2}`;
	        }
	        else if (time !== null) {
	          output += ` at ${time}`;
	        }

	        //Add activity to database
	        if(time !== null){
	          console.log("Saving 2 Activities to DB - Time");
	          saveActivityToDBTime(agent, activity, dbDay1, dbTime1).then(saveActivityToDBTime(agent, activity, dbDay2, dbTime2))//;
	          //saveActivityToDBTime(agent, activity, dbDay2, dbTime2);
	        }
	        else if(time1 !== null){
	          console.log("Saving 2 Activities to DB - Time1 & Time 2");
	          await saveActivityToDBTime(agent, activity, dbDay1, dbTime1).then(saveActivityToDBTime(agent, activity, dbDay2, dbTime2))//;
	          //saveActivityToDBTime(agent, activity, dbDay2, dbTime2);
	        }
	        else if(date1 !== null){
	          console.log("Saving 2 Activities to DB - Date1 & Date 2");
	          await saveActivityToDB(agent, activity, dbDay1).then(saveActivityToDB(agent, activity, dbDay2))//;
	          //saveActivityToDB(agent, activity, dbDay2);
	        }
	      }
	      //Two activities, One day
	      else if(activities[i].activity1 !== undefined && activities[i].date !== undefined) {
					console.log("Two Activities, One Day");
					const d = activities[i].date;
	        const date = new Date(d);
	        const day = weekday[date.getDay()];
	        const dbDay = day.substring(0,3).toLowerCase();
	        const activity1 = activities[i].activity1;
	        const activity2 = activities[i].activity2;
	        var time1 = null;
	        var time2 = null;
	        var dbTime1 = null;
	        var dbTime2 = null;

	        if(activities[i].time1 !== undefined){
	          const t1 = activities[i].time1;
	          const t2 = activities[i].time2;
	          const timeFormat1 = new Date(t1);
	          const timeFormat2 = new Date(t2);
	          var datetime1 = new Date(date.getFullYear(), date.getMonth(), date.getDate(),
	                        timeFormat1.getHours(), timeFormat1.getMinutes(), timeFormat1.getSeconds());
	          var datetime2 = new Date(date.getFullYear(), date.getMonth(), date.getDate(),
	                        timeFormat2.getHours(), timeFormat2.getMinutes(), timeFormat2.getSeconds());

	          dbTime1 = datetime1;
	          dbTime2 = datetime2;
	          time1 = timeFormat1.toLocaleTimeString('en-gb',
	          { timeZone: 'Europe/London', hour: 'numeric', minute: 'numeric', hour12: true });
	          time2 = timeFormat2.toLocaleTimeString('en-gb',
	          { timeZone: 'Europe/London', hour: 'numeric', minute: 'numeric', hour12: true });
	        }

	        if (i + 1 === activities.length && activities.length > 1) {
	          output += ` and `;
	        }

	        output += `${activity1}`;
	        if (time1 !== time2) {
	          output += ` at ${time1}`;
	        }
	        output += ` and ${activity2}`
	        if (time2 !== null) {
	          output += ` at ${time2}`;
	        }
	        output += ` on ${day}`;

	        //Add activity to database
	        if(time1 !== null){
						var activityObject = createActivityObject(activity1, dbTime1, activity2, dbTime2);
	          console.log("Saving 2 Activities to DB - Time1 & Time 2");
	          saveTwoActivitiesToDB(agent, activityObject, dbDay);
	          //await saveActivityToDBTime(agent, activity2, dbDay, dbTime2);
	        }
	        else if(activity1 !== null){
						var activityObject = createActivityObject(activity1, activity2);
	          console.log("Saving 2 Activities to DB - Activity1 & Activity2");
						saveTwoActivitiesToDB(agent, activityObject, dbDay);
	          //saveActivityToDB(agent, activity2, dbDay);
	        }
	      }

				if (i + 1 === activities.length) {
		      output += `.`
		    }
		    else {
		      output += `, `;
		    }

	    }

	    output += ` Have fun!`;
		agent.add(output);
		agent.add(await getEndMessage('end'));
	  }
	  else {
	    agent.add(`Sorry, I didn't catch that. Can you tell me what activity and the day you are doing it?`);
	  }
	}

	async function noActivities(agent) {
		agent.add(`That's ok! Let's try to fit in some activities during the week if we can.`);
		agent.add(await getEndMessage('end'));
	}

	function createActivityObject(activity1, activity2, time1, time2) {
		if (time1 !== null && time2 !== null){
			var object = [{activity: activity1, time: time1}, {activity: activity2, time: time2}];
		}
		else if(time1 !== null) {
			var object = [{activity: activity1, time: time1}, {activity: activity2}];
		}
		else if(time2 !== null) {
			var object = [{activity: activity1}, {activity: activity2, time: time2}];
		}
		else {
			var object = [{activity: activity1}, {activity: activity2}];
		}
		return object;
	}

	async function saveTwoActivitiesToDB(agent, object, day) {
	  var dayDigit = null;
	  let userID = getID(agent);
	  //console.log("UserID = "+userID);
	  //console.log("Activity: "+activity +", Day: "+day);
	  var activityPath = 'week_calendar.'+day;
	  //console.log("activitypath = "+activityPath);
	  var errors = "Error saveTwoActivitiesToDB";
	  //transform 3 letter code to weekday digit
	  switch (day) {
	    case "sun":
	      dayDigit = 0;
	      break;
	    case "mon":
	      dayDigit = 1;
	      break;
	    case "tue":
	      dayDigit = 2;
	      break;
	    case "wed":
	      dayDigit = 3;
	      break;
	    case "thu":
	      dayDigit = 4;
	      break;
	    case "fri":
	      dayDigit = 5;
	      break;
	    case "sat":
	      dayDigit = 6;
	      break;
	  }
		console.log("DayDigit: "+dayDigit);

	  let oldData = await getData(agent, "calendar", dayDigit);
	  var docRef = admin.firestore().collection('users').doc(userID);
	    docRef.get().then(function(doc) {
	      if (doc.exists) {
	        console.log('saveTwoActivitiesToDB => USER ID MATCHED');
	        var usersRef = admin.firestore().collection('users');
	        var newData = object;
	        /*oldData = JSON.stringify(oldData);
	        console.log("Old Data: "+oldData);
					oldData = JSON.parse(oldData);*/
	        oldData = oldData.concat(newData);
					/*oldData = JSON.stringify(oldData);
	        console.log("New Data: "+oldData);
					oldData = JSON.parse(oldData);*/
	        var setSf = usersRef.doc(userID).update({
	          [activityPath]: oldData
	        });
	        return null;
	      }
	      else {
	        console.log('saveActivityToDB => USER NOT IN DB');
	      }
	      return null;
	    })
	    .catch(errors);
	}

	async function saveActivityToDB(agent, activity, day) {
	  var dayDigit = null;
	  let userID = getID(agent);
	  //console.log("UserID = "+userID);
	  console.log("Activity: "+activity +", Day: "+day);
	  var activityPath = 'week_calendar.'+day;
	  //console.log("activitypath = "+activityPath);
	  var errors = "Error saveActivityToDB";
	  //transform 3 letter code to weekday digit
	  switch (day) {
	    case "sun":
	      dayDigit = 0;
	      break;
	    case "mon":
	      dayDigit = 1;
	      break;
	    case "tue":
	      dayDigit = 2;
	      break;
	    case "wed":
	      dayDigit = 3;
	      break;
	    case "thu":
	      dayDigit = 4;
	      break;
	    case "fri":
	      dayDigit = 5;
	      break;
	    case "sat":
	      dayDigit = 6;
	      break;
	  }
	  console.log("DayDigit: "+dayDigit);

	  let oldData = await getData(agent, "calendar", dayDigit);
	  var docRef = admin.firestore().collection('users').doc(userID);
	    docRef.get().then(function(doc) {
	      if (doc.exists) {
	        console.log('saveActivityToDB => USER ID MATCHED');
	        var usersRef = admin.firestore().collection('users');
	        var newData = {activity: activity};
	        // oldData = JSON.stringify(oldData);
	        // console.log("Old Data: "+oldData);
	        // oldData = JSON.parse(oldData);
	        oldData.push(newData);
	        console.log("New Data: "+oldData);
	        var setSf = usersRef.doc(userID).update({
	          [activityPath]: oldData
	        });
	        return null;
	      }
	      else {
	        console.log('saveActivityToDB => USER NOT IN DB');
	      }
	      return null;
	    })
	    .catch(errors);
	}

	async function saveActivityToDBTime(agent, activity, day, time) {
		var dayDigit = null;
		let userID = getID(agent);
		//console.log("UserID = "+userID);
		console.log("Activity: "+activity +", Day: "+day+", Time: "+time);
		var activityPath = 'week_calendar.'+day;

		var errors = "Error saveActivityToDBTime";
		//transform 3 letter code to weekday digit
		switch (day) {
			case "sun":
				dayDigit = 0;
				break;
			case "mon":
				dayDigit = 1;
				break;
			case "tue":
				dayDigit = 2;
				break;
			case "wed":
				dayDigit = 3;
				break;
			case "thu":
				dayDigit = 4;
				break;
			case "fri":
				dayDigit = 5;
				break;
			case "sat":
				dayDigit = 6;
				break;
		}
		console.log("DayDigit: "+dayDigit);

		let oldData = await getData(agent, "calendar", dayDigit);
		var docRef = admin.firestore().collection('users').doc(userID);
			docRef.get().then(function(doc) {
				if (doc.exists) {
					console.log('saveActivityToDBTime => USER ID MATCHED');
					var usersRef = admin.firestore().collection('users');
					var newData = {activity: activity, time: time};
	        // oldData = JSON.stringify(oldData);
	        // console.log("Old Data: "+oldData);
	        // oldData = JSON.parse(oldData);
	        oldData.push(newData);
	        console.log("New Data: "+oldData);
					var setSf = usersRef.doc(userID).update({
						[activityPath]: oldData
					});
					return null;
				}
				else {
					console.log('saveActivityToDBTime => USER NOT IN DB');
				}
				return null;
			})
			.catch(errors);
	}

	// Run the proper function handler based on the matched Dialogflow intent name
	let intentMap = new Map();
	intentMap.set('Default Welcome Intent', welcome);
	intentMap.set('Default Fallback Intent', fallback);
	intentMap.set('ECB_exercise', startExercise);
	intentMap.set('ECB_exercise - yes', exerciseFromBegin);
	intentMap.set('ECB_exercise - ok', exerciseOk);
	intentMap.set('ECB_exercise - no', exerciseRepeat);
	intentMap.set('ECB_exercise - SbS', exerciseSbS);
	intentMap.set('ECB_step', steps);
	intentMap.set('ECB_step - ok', exerciseOk);
	intentMap.set('ECB_step - repeat', stepRepeat);
	intentMap.set('ECB_session', startSession);
	intentMap.set('ECB_session - yes', sessionFromBegin);
	intentMap.set('ECB_session - next', sessionNext);
	intentMap.set('ECB_session - previous', sessionPrevious);
	intentMap.set('ECB_session - repeat', sessionRepeat);
	intentMap.set('ECB_session - SbS', exerciseSbS);
	intentMap.set('ECB_session - SbS - ok', steps);
	intentMap.set('ECB_session - repeatAllSession', sessionRepeatAllsession);
	intentMap.set('ECB_cals', calories);
	intentMap.set('ECB_end', finish);
	intentMap.set('ECB_tutorial', tutorial);
	intentMap.set('ECB_test', test);
	intentMap.set('Personalisation Start', startPersonalisation);
	intentMap.set('GetUserName', getUserName);
	intentMap.set('Age', getUserAge);
	intentMap.set('Gender', getUserGender);
	intentMap.set('Height', getUserHeight);
	intentMap.set('Weight', getUserWeight);
	intentMap.set('Location', location);
	intentMap.set('PA Guideline', paGuideline);
	intentMap.set('Ex Guideline', exGuideline);
	intentMap.set('Goal Setting', goalSetting);
	intentMap.set('StepsGoal', stepsGoal);
	intentMap.set('NumberOfSteps', numberOfSteps);
	intentMap.set('NoStepGoal', noSteps);
	intentMap.set('ActivityGoal', activityGoal);
	intentMap.set('SettingActivities', setActivities);
	intentMap.set('NoActivities', noActivities);
	intentMap.set('FollowUp Reporting', followupReporting);
	intentMap.set('FollowUp Reporting - yes', followupReportingYes);
	intentMap.set('FollowUp Reporting - duration', followupReportingYes);
	intentMap.set('FollowUp Reporting - duration - no', followupReportingYesNo);
	intentMap.set('FollowUp Reporting - yes - duration', followupReportingYes);
	intentMap.set('FollowUp Reporting - yes - no', followupReportingYesNo);
	intentMap.set('FollowUp Reporting - yes - activity', followupReportingYes);
	intentMap.set('FollowUp Reporting - yes - activity - duration', followupReportingYes);
	intentMap.set('FollowUp Reporting - no', followupReportingNo);
	intentMap.set('FollowUp Reporting - no - no', followupReportingNoNone);
	intentMap.set('FollowUp Reporting - no - reason', followupReportingNoReason);
	intentMap.set('Summary', summary);

	// intentMap.set('your intent name here', googleAssistantHandler);
	agent.handleRequest(intentMap);
});


///https://console.firebase.google.com/project/exercisecoachbot/overview

///https://us-central1-exercisecoachbot.cloudfunctions.net/dialogflowFirebaseFulfillment
