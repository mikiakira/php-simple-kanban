function exePost(mode, action, id, title, contents, label, etc1) {
    return $.ajax({
        type: "POST",
        url: "pdo.php",
        dataType: 'text',
        data: {
            mode: mode,
            action: action,
            id: id,
            label: label,
            title: title,
            contents: contents,
            etc1: etc1
        }
    })
}

// JS で PHP の nl2br
function nl2br(str) {
    if(!str){
    }else{
        str = str.replace(/\r\n/g, "<br />");
        str = str.replace(/(\n|\r)/g, "<br />");
    }
    return str;
}