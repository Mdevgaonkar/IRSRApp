var rABS = true; // true: readAsBinaryString ; false: readAsArrayBuffer
var inputFile = document.getElementById("dataFileXlsx");
var colBook = ["ISBN",	"title",	'author',	"description",	"publisher",	"photofile",	"edition",	"publicationYear"];
var colInstru = ["type",	"photoFile",	"instrumentName",	"instrumentSubtitle",	"description"];
var colBranches = ["branch",	"branchShort"];
inputFile.addEventListener('change', handleFile, false);
var fileDataJSON ;


$(document).ready(function(){
    $("#dataWindow").hide();
    $("input[name='typeOption']").change(function(){
    // Do something interesting here
    $("#dataFileXlsx").val('');
    $("#filename").val('');
    $("#output").html('');
    $("#table").html('');
    var div = $("#filename").closest("div");
    div.removeClass("has-error");
    div.removeClass("has-success");
    $("#glyphfalse").remove();
    $("#glyphtrue").remove();
    
    });
});


$(function() {

  // We can attach the `fileselect` event to all file inputs on the page
  $(document).on('change', ':file', function() {
    var input = $(this),
        numFiles = input.get(0).files ? input.get(0).files.length : 1,
        label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
    input.trigger('fileselect', [numFiles, label]);
  });

  // We can watch for our custom `fileselect` event like this
  $(document).ready( function() {
      $(':file').on('fileselect', function(event, numFiles, label) {

          var input = $(this).parents('.input-group').find(':text'),
              log = numFiles > 1 ? numFiles + ' files selected' : label;

          if( input.length ) {
              input.val(log);
          } else {
              if( log ) alert(log);
          }

      });
  });
  
});

function validateFileExt(filename){
  var file_regex = /\.xlsx$/;
//    alert($("#"+id).val());
    if(!file_regex.test(filename))
    {
        var div = $("#filename").closest("div");
        div.removeClass("has-success");
        $("#glypcn"+"filename").remove();
        div.addClass("has-error has-feedback");
        div.append('<span id="glyphfalse" class="glyphicon glyphicon-remove form-control-feedback"></span>');
        return false;
    }
    else{
        var div = $("#filename").closest("div");
        div.removeClass("has-error");
        $("#glypcn"+"filename").remove();
        div.addClass("has-success has-feedback");
        div.append('<span id="glyphtrue" class="glyphicon glyphicon-ok form-control-feedback"></span>');
        return true;
    }
}

/* processing array buffers, only required for readAsArrayBuffer */
function fixdata(data) {
    var o = "", l = 0, w = 10240;
    for(; l<data.byteLength/w; ++l) o+=String.fromCharCode.apply(null,new Uint8Array(data.slice(l*w,l*w+w)));
    o+=String.fromCharCode.apply(null, new Uint8Array(data.slice(l*w)));
    return o;
}

/* getting radio button selection*/
function isRadioSelected(){
    var radioValue = $("input[name='typeOption']:checked"). val();
    if(radioValue!=null){
        return true;
    }else{
        return false;
    }
    
}

function handleFile(e) {
    if(isRadioSelected()){
        var radioValue = $("input[name='typeOption']:checked"). val();
        if(radioValue == "B"){
            fileReader(e,colBook);
        }else if (radioValue == "I"){
            fileReader(e,colInstru);
        }else if (radioValue == "Br"){
            fileReader(e,colBranches);
        }
    }else{
        $.notify("Please select a type","error");
    }
          

}

function fileReader(e,col){
    var files = e.target.files;
          var i,f;
          for (i = 0; i != files.length; ++i) {
            f = files[i];
            var reader = new FileReader();
            var name = f.name;
              if(validateFileExt(name)){
            reader.onload = function(e) {
              var data = e.target.result;

              var workbook;
              if(rABS) {
                /* if binary string, read with type 'binary' */
                workbook = XLSX.read(data, {type: 'binary'});
              } else {
                /* if array buffer, convert to base64 */
                var arr = fixdata(data);
                workbook = XLSX.read(btoa(arr), {type: 'base64'});
              }

              /* DO SOMETHING WITH workbook HERE */
                var first_sheet_name = workbook.SheetNames[0];
                /* Get worksheet */
                var worksheet = workbook.Sheets[first_sheet_name];
                console.log(XLSX.utils.sheet_to_json(worksheet,{raw:true}));
                var output = JSON.stringify(XLSX.utils.sheet_to_json(worksheet,{raw:true}), null, '\t');
                tableWriter(JSON.parse(output),col);
                fileDataJSON = JSON.parse(output);
                var boooks = getBookObj(fileDataJSON,col);
                $("#output").html('');
                $("#output").append(JSON.stringify(boooks));
                
            };
            reader.readAsBinaryString(f);
          }else{
              $("#output").html("");
          }
            }
}

function tableWriter(JSONdata,col) {
    
    $("#dataWindow").show();
        // CREATE DYNAMIC TABLE.
        var table = document.createElement("table");
        table.setAttribute("class","table  table-hover table-condensed table-responsive");
        table.setAttribute("id","dataTable");
        // CREATE HTML TABLE HEADER ROW USING THE EXTRACTED HEADERS ABOVE.

        var tr = table.insertRow(-1);                   // TABLE ROW.

        for (var i = 0; i < col.length; i++) {
            var th = document.createElement("th");      // TABLE HEADER.
            th.innerHTML = col[i];
            tr.appendChild(th);
        }

        // ADD JSON DATA TO THE TABLE AS ROWS.
        for (var i = 0; i < JSONdata.length; i++) {

            tr = table.insertRow(-1);

            for (var j = 0; j < col.length; j++) {
                var tabCell = tr.insertCell(-1);
                var data =  JSONdata[i][col[j]];
                if(data != null){
                    tabCell.innerHTML = data;    
                }else{
                    tabCell.innerHTML = "";    
                    tabCell.setAttribute("class","danger");
                }
            }
        }

        // FINALLY ADD THE NEWLY CREATED TABLE WITH JSON DATA TO A CONTAINER.
        var divContainer = document.getElementById("table");
        divContainer.innerHTML = "";
        divContainer.appendChild(table);
}

function uploadData(col){
    makeJSONObj(fileDataJSON,col); 
}

function makeJSONObj(fileDataJSON,col){
    var radioValue = $("input[name='typeOption']:checked"). val();
    if(radioValue == 'B'){
        getBookObj(fileDataJSON,col);
    }else if(radioValue == 'I'){
        getInstruObj(fileDataJSON,col);
    }else if(radioValue == 'Br'){
        getBranchObj(fileDataJSON,col);    
    }
}

function getBookObj(fileDataJSON,col){
    var books=[];
    
        for (var i = 0; i < fileDataJSON.length; i++) {        
            var book = {};
            for (var j = 0; j < col.length; j++) {
                book[col[j]]= ''+fileDataJSON[i][col[j]];
            }
            books.push(book);
        }
    console.log(books);
    return books;
}

function getInstruObj(fileDataJSON,col){
    var Instrus=[];
    
        for (var i = 0; i < fileDataJSON.length; i++) {        
            var instru = {};
            for (var j = 0; j < col.length; j++) {
                instru[col[j]]= ''+fileDataJSON[i][col[j]];
            }
            Instrus.push(instru);
        }
    console.log(Instrus);
    return Instrus;
}

function getBranchObj(fileDataJSON,col){
    var Branches=[];
    
        for (var i = 0; i < fileDataJSON.length; i++) {        
            var branch = {};
            for (var j = 0; j < col.length; j++) {
                branch[col[j]]= ''+fileDataJSON[i][col[j]];
            }
            Branches.push(branch);
        }
    console.log(Branches);
    return Branches;
}

