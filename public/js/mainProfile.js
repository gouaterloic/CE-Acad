const vR = document.getElementsByClassName('view-referree')[0];
var xhr = new XMLHttpRequest;

vR.addEventListener('click',()=>{
    if (vR.innerText == "View Referree"){
        vR.innerText = "Hide Referree";
        xhr.open('GET',`/dashboard/profile/get-referree`,true);
        xhr.onload = ()=>{
            rs = JSON.parse(xhr.responseText);
            rs.reverse();
            resDiv = document.getElementById("transactions").appendChild(document.createElement('div'));
            resDiv.classList.add('results-container')
            tab = resDiv.appendChild(document.createElement('table'));
            var str = `
            <tr>
                <th>Date Created</th>
                <th>Username</th>
            </tr>
            `;
            rs.forEach((r,ind)=>{
                dat = new Date(r.date);
                str += `
                <tr>
                    <td>${dat.toDateString()}</td>
                    <td>${r.username}</td>
                </tr>
                `
            })
            tab.innerHTML = str;
        };
        xhr.send();
    }else{
        vR.innerText = "View Referree";
        document.getElementById("transactions").removeChild(document.getElementsByClassName('results-container')[0]);
    }
})