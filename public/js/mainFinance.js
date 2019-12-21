const vR = document.getElementsByClassName('view-transactions')[0];
var xhr = new XMLHttpRequest;

vR.addEventListener('click',()=>{
    if (vR.innerText == "View Transactions"){
        vR.innerText = "Hide Transactions";
        xhr.open('GET',`/dashboard/finance/get-transactions`,true);
        xhr.onload = ()=>{
            rs = JSON.parse(xhr.responseText);
            rs.reverse();
            tab = document.getElementById("transactions").appendChild(document.createElement('table'));
            var str = `
            <tr>
                <th>Date</th>
                <th>Type</th>
                <th>From/To</th>
                <th>Old Revenue (FCFA)</th>
                <th>Amount (FCFA)</th>
                <th>Fee (FCFA)</th>
                <th>New Revenue (FCFA)</th>
            </tr>
            `;
            rs.forEach((r,ind)=>{
                dat = new Date(r.date);
                str += `
                <tr>
                    <td>${dat.toDateString()}</td>
                    <td>${r.type}</td>
                    <td>${r.from_to}</td>
                    <td>${r.old_revenue}</td>
                    <td>${r.amount}</td>
                    <td>${r.fee}</td>
                    <td>${r.new_revenue}</td>
                </tr>
                `
            })
            tab.innerHTML = str;
        };
        xhr.send();
    }else{
        vR.innerText = "View Transactions";
        document.getElementById("transactions").removeChild(document.getElementsByTagName('table')[0]);
    }
})