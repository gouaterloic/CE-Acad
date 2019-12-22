const play = Array.from(document.getElementsByClassName('play'));
const viewResults = Array.from(document.getElementsByClassName('view-results'));
const quizLayer = document.getElementById('quiz-layer');

var xhr = new XMLHttpRequest;
var questions = [];
var results = [];//label correctAnswer choosenAnswer Point
var questionNum = 1;
const numberOfQuestions = 3;
var randomIndex = 0;
var started = false;
var timeLeft = 300;
var countDownfun;
var quiz;

// Take Quiz Now Button Callback
if(typeof play !== undefined){
    if(play.length>0){
        play.forEach(p=>{
            p.addEventListener('click',()=>{
                // Quiz Home Page
                questionLabel = document.getElementsByClassName('quiz-container')[0].appendChild(document.createElement('h1'));
                questionLabel.id = "question-label";
                questionLabel.innerText = "Ready? Select any answer below to start the quiz"
                answersDiv = document.getElementsByClassName('quiz-container')[0].appendChild(document.createElement('div'));
                answersDiv.classList.add("answers");
                answersDiv.innerHTML = `
                    <h1 class="answer">A <span id="choice0">God</span></h1>
                    <h1 class="answer">B <span id="choice1">Loves</span></h1>
                    <h1 class="answer">C <span id="choice2">You</span></h1>
                    <h1 class="answer">D <span id="choice3">As Himself</span></h1>
                `;
                choiceSelect()
                cancel = document.getElementsByClassName('quiz-container')[0].appendChild(document.createElement('button'));
                cancel.classList.add('btn');
                cancel.innerText = "Cancel"
                cancel.addEventListener('click',()=>{
                    document.getElementsByClassName('quiz-container')[0].removeChild(document.getElementsByClassName('answers')[0]);
                    document.getElementsByClassName('quiz-container')[0].removeChild(document.getElementById("question-label"));
                    document.getElementsByClassName('quiz-container')[0].removeChild(document.getElementsByTagName('button')[0]);
                    quizLayer.style.visibility = "hidden";
                })
                // Get questions from Database
                xhr.open('GET',`/dashboard/quiz/get-questions?level=${p.dataset.level}&topic=${p.dataset.topic}&subject=${p.dataset.subject}&numberOfQuestions=${numberOfQuestions}`,true);
                xhr.onload = ()=>{
                    questions = JSON.parse(xhr.responseText)
                    quiz = {
                        id: p.dataset.id,
                        subject: p.dataset.subject,
                        level: p.dataset.level,
                        topic: p.dataset.topic
                    }
                    document.getElementById("count-down").innerText = timeDisplay(timeLeft);
                    document.getElementById("question-number").innerText = 0;
                    document.getElementById("number-of-questions").innerText = numberOfQuestions;
                    quizLayer.style.visibility = "visible";
                };
                xhr.send();
                
            })
        })
    }
}

function choiceSelect(){
    const choices = Array.from(document.getElementsByClassName('answer'));
    choices.forEach((choice,ind)=>{
        choice.addEventListener('click',()=>{
            if (started){
                results[results.length-1][2] = document.getElementById(`choice${String(ind)}`).innerText
                results[results.length-1][3] = results[results.length-1][2] === results[results.length-1][1] ? 1 : 0;
                if (questionNum<numberOfQuestions){
                    questionNum++
                    randomIndex = Math.floor(Math.random() * questions.length);
                    displayQuestion(questions[randomIndex],[questionNum,numberOfQuestions]);
                    questions.splice(randomIndex,1)
                }else{
                    clearInterval(countDownfun);
                    displayResults()
                }
            }else{
                started = true;
                document.getElementsByClassName('quiz-container')[0].removeChild(document.getElementsByTagName('button')[0]);
                randomIndex = Math.floor(Math.random() * questions.length);
                displayQuestion(questions[randomIndex],[questionNum,numberOfQuestions]);
                questions.splice(randomIndex,1);
                countDownfun = setInterval(countDown,1000);
            }
        })
        
    })
}

// View Results
// Take Quiz Now Button Callback
if(typeof viewResults !== undefined){
    if(viewResults.length>0){
        viewResults.forEach(vR=>{
            vR.addEventListener('click',()=>{
                if (vR.innerText == "View Results"){
                    vR.innerText = "Hide Results";
                    xhr.open('GET',`/dashboard/quiz/get-results?quizID=${vR.dataset.id}`,true);
                    xhr.onload = ()=>{
                        rs = JSON.parse(xhr.responseText);
                        rs.reverse();
                        tab = document.getElementById(`${vR.dataset.id}`).appendChild(document.createElement('table'));
                        var str = `
                        <tr>
                            <th>Session</th>
                            <th>Date</th>
                            <th>First</th>
                            <th>Second</th>
                            <th>Third</th>
                            <th>Fourth</th>
                        </tr>
                        `;
                        rs.forEach((r,ind)=>{
                            dat = new Date(r.date);
                            str += `
                            <tr>
                                <td>${r.round}</td>
                                <td>${dat.toDateString()}</td>
                                <td>${r.player1_id}(${r.player1_points})</td>
                                <td>${r.player2_id}(${r.player2_points})</td>
                                <td>${r.player3_id}(${r.player3_points})</td>
                                <td>${r.player4_id}(${r.player4_points})</td>
                            </tr>
                            `
                        })
                        tab.innerHTML = str;
                    };
                    xhr.send();
                }else{
                    vR.innerText = "View Results";
                    document.getElementById(`${vR.dataset.id}`).removeChild(document.getElementsByTagName('table')[0]);
                }
            })
        })
    }
}

// Functions
function displayQuestion(question,pos){
    document.getElementById("question-number").innerText = pos[0]
    document.getElementById("number-of-questions").innerText = pos[1]
    document.getElementById("question-label").innerText = question.label
    document.getElementById("choice0").innerText = question.answers[0]
    document.getElementById("choice1").innerText = question.answers[1]
    document.getElementById("choice2").innerText = question.answers[2]
    document.getElementById("choice3").innerText = question.answers[3]
    results.push([question.label,question.correct,"",0])
}

function displayResults(){
    // Calculate total points
    var totalPoints = 0;
    results.forEach(res=>{
        totalPoints += res[3]
    })
    // Results procession
    xhr.open('POST',`/dashboard/quiz/results`,true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.onload = ()=>{
        var s = JSON.parse(xhr.responseText);
        // Displaying Results Proper
        document.getElementsByClassName('quiz-container')[0].removeChild(document.getElementsByClassName('answers')[0]);
        document.getElementsByClassName('quiz-container')[0].removeChild(document.getElementById("question-label"));
        document.getElementById("count-down").innerText = "Quiz Results";
        document.getElementById("title").innerText = "Score: ";
        document.getElementById("question-number").innerText = totalPoints;
        tab = document.getElementsByClassName('quiz-container')[0].appendChild(document.createElement('table'));
        var str = `
        <tr>
            <th>No</th>
            <th>Question</th>
            <th>Correct Answer</th>
            <th>Chosen Answer</th>
            <th>Point Obtained</th>
        </tr>
        `;
        results.forEach((res,ind)=>{
            if (res[2]){
                if (res[3]>0){
                    str += `
                    <tr>
                        <td>${ind+1}</td>
                        <td>${res[0]}</td>
                        <td>${res[1]}</td>
                        <td style = "color:green;">${res[2]}</td>
                        <td>${res[3]}</td>
                    </tr>
                    `
                }else{
                    str += `
                    <tr>
                        <td>${ind+1}</td>
                        <td>${res[0]}</td>
                        <td>${res[1]}</td>
                        <td style = "color:red;">${res[2]}</td>
                        <td>${res[3]}</td>
                    </tr>
                    `
                }
            }
        })
        tab.innerHTML = str;
        done = document.getElementsByClassName('quiz-container')[0].appendChild(document.createElement('button'));
        done.classList.add('btn');
        done.innerHTML = `<a href="/dashboard/quiz/">Done</a>`
    };
    xhr.send(`totalPoints=${totalPoints}&quizID=${quiz.id}&numberOfQuestions=${numberOfQuestions}`);
}

function countDown(){
    timeLeft--;
    document.getElementById("count-down").innerText = timeDisplay(timeLeft);
    if (timeLeft==0){
        clearInterval(countDownfun);
        displayResults()
    }
}

function timeDisplay(tim){
    min = Math.floor(tim/60);
    sec = (tim - min*60)% 60;
    if(sec<10){
        return `Time Left: 0${min} : 0${sec}`
    }
    else{
        return `Time Left: 0${min} : ${sec}`
    }
}