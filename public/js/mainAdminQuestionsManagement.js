const subj = document.getElementById('subjects');
var $topi = $("#topics");
var $lev = $("#levels");

const topics = {
    English:['Grammar','Vocabulary','Synonyms'],
    Mathematics:['Arithmetics','Algebra','Calculus']
};

const levels = {
    English:['Elementary','Pre-Intermediate','Intermediate','Advanced'],
    Mathematics:['Elementary','Intermediate','Advanced']
};

subj.addEventListener('change',()=>{
    var value = subj.value;
    if(value){
        $topi.empty();
        topics[value].forEach((topic,i) => {
            $newOptTop = $("<option>").attr("value",topic).text(topic);
            $topi.append($newOptTop);
        });
        $topi.trigger('contentChanged');

        $lev.empty();
        levels[value].forEach((level,i) => {
            $newOptLev = $("<option>").attr("value",level).text(level);
            $lev.append($newOptLev);
        });
        $lev.trigger('contentChanged');
    }
})