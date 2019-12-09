const play = Array.from(document.getElementsByClassName('play'));
const register = Array.from(document.getElementsByClassName('register'));
const Http = new XMLHttpRequest();

if(play.length>0){
    console.log(typeof play)
    play.forEach(pl=>{
        pl.addEventListener('click',()=>{
            
        })
        console.log(pl.dataset.subject)
    })
}

// $('.register').click(()=>{
//     $.get("/dashboard/profile",(data,status)=>console.log(`${status}`))
// })

if(register.length>0){
    register.forEach(reg=>{
        
        // reg.addEventListener('click',()=>{
        //     Http.open("GET","/dashboard/profile")
        //     Http.send();
        //     console.log(Http.responseText)
        // })
        // console.log(reg.dataset.registration_fee)
    })
}

// if(typeof register != 'undefined'){
//     register.addEventListener('click',()=>{
//         console.log(register.getAttribute('data-registration_fee'));
//     })
// }

