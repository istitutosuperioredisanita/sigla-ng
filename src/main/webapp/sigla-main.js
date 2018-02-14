(function () {
      if ( typeof window.CustomEvent === "function" ) return false;
      function CustomEvent ( event, params ) {
        params = params || { bubbles: false, cancelable: false, detail: undefined };
        var evt = document.createEvent( 'CustomEvent' );
        evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
        return evt;
       }    
      CustomEvent.prototype = window.Event.prototype;
      window.CustomEvent = CustomEvent;
})();
function submitForm(comando) {
    if (document.mainForm.modal) return;
    document.mainForm.comando.value = comando;
    if (document.mainForm.scrollx) {
        if (window.pageXOffset)
            document.mainForm.scrollx.value = window.pageXOffset;
        else
            document.mainForm.scrollx.value = document.body.scrollLeft;
    }
    if (document.mainForm.scrolly) {
        if (window.pageYOffset)
            document.mainForm.scrolly.value = window.pageYOffset;
        else
            document.mainForm.scrolly.value = document.body.scrollTop;
    }
    window.onloadHandlers = undefined;
    document.body.dispatchEvent(new CustomEvent('submitForm',{
         'detail': {
             'comando': comando,
             'form' : document.mainForm
         }
    }));
    return false;
}
function disableDblClick() {
    if(document.mainForm.submitted != true)
        return true;
    return false;
}
function focused(element) {
    if (document.mainForm.focusedElement)
        document.mainForm.focusedElement.value = element.name;
}        
// Funzioni per implementare effetto di rollover
function setClassNames(element) {
    if (!element.originalClassName) {
        element.originalClassName = element.className;
        element.upClassName = element.className+"Up";
        element.downClassName = element.className+"Down";
        element.overClassName = element.className+"Over";
    }
}
function mouseOver(element) {
    if (document.mainForm.submitted) return;
    setClassNames(element);
    element.className = element.overClassName;
}
function mouseOut(element) {
    if (document.mainForm.submitted) return;
    setClassNames(element);
    element.className = element.originalClassName;
}
function mouseDown(element) {
    if (document.mainForm.submitted) return;
    setClassNames(element);
    element.className=element.downClassName
}
function mouseUp(element) {
    if (document.mainForm.submitted) return;
    setClassNames(element);
    element.className=element.upClassName
}
// Funzione per evitare propagazioni di eventi in IE
function cancelBubble(event) {
    if (event)
        event.cancelBubble = true;
}
// Funzione invocata per cambiare pagina in un tab
function doTab(tabName,pageName) {
    submitForm("doTab("+tabName+","+pageName+")");
}
// funzione invocata per selezionare una riga in una tabella
function select(name,index) {
    if (disableDblClick()) {
        document.mainForm.elements[name+".focus"].value=index;
        submitForm("doSelection("+name+")");
    }
}

// Funzione invocata per selezionare una riga in una tabella
function doNavigate(name,index) {
    if (disableDblClick())
        submitForm("doNavigate("+name+","+index+")");
}

function sort(name,property) {
    if (disableDblClick()) {
        submitForm("doSort("+name+","+property+")");
    }
}

function hiddenColumn(name,property) {
    if (disableDblClick()) {
        submitForm("doHiddenColumn("+name+","+property+")");
    }
}

function selectAll(tableName) {
    elementName = tableName+".selection";
    for (j = 0;j < document.mainForm.elements.length;j++)
        if (document.mainForm.elements[j].name == elementName && document.mainForm.elements[j].checked != null)
                    document.mainForm.elements[j].checked = !document.mainForm.elements[j].checked;
}

// Funzioni invocate dai bottoni di una finestra di CRUD
function doCerca() {
    submitForm('doCerca');
}

function doRicercaLibera() {
    submitForm('doRicercaLibera');
}

function doSalva() {
    submitForm('doSalva');
}

function doNuovo() {
    submitForm('doNuovo');
}

function doElimina() {
    if (confirm('Vuoi confermare la cancellazione?'))
        submitForm('doElimina');
}

function doNuovaRicerca() {
    submitForm('doNuovaRicerca');
}

function doRiporta() {
    submitForm('doRiporta');
}

function doAnnullaRiporta() {
    submitForm('doAnnullaRiporta');
}

function doChiudiForm() {
    submitForm('doCloseForm');
}

function doStampa() {
    submitForm('doPrint');
}
function doHelp(url) {
    window.open(url, "Aiuto", 'toolbar=no,resizable,scrollbars,width=800,height=600').focus()
}
function doExcel() {
    submitForm('doExcel');
}
function doScaricaExcel(url) {
    window.open(url, "Excel", 'toolbar=no,resizable,scrollbars,width=800,height=600').focus() 
}
function doPrint(url) {
    window.open(url, "Stampa", 'toolbar=no,resizable,scrollbars,width=800,height=600').focus() 
}
function handleOnLoad() {
    window.onloadHandlers.evaluate()
}

function MultiEventHandler(handler,next,priority) {
    this.handler = handler;
    this.next = next;
    this.priority = priority;
    function evaluate() {
        if (this.next) this.next.evaluate()
        if (this.handler) this.handler();
    }
    this.evaluate = evaluate
}

function addOnloadHandler(handler,priority) {
    var curr = window.onloadHandlers;
    var prev = null;
    while((curr != null) && (priority >= curr.priority)) {
        prev = curr;
        curr = curr.next;
    }
    var meh = new MultiEventHandler(handler,curr,priority);
    if (prev == null) {
        window.onloadHandlers = meh;
    } else {
        prev.next = meh;
    }
    handleOnLoad();
}
function scrollIntoView(elementName) {
    try {
        document.getElementById(elementName).scrollIntoView(false);
    } catch(e) {

    }
    
}

// Funzioni per gli input modali
function modalInputFocused(input) {
    var form = input.form
    var confirmButton = form.elements[input.name+".confirm"]
    var cancelButton = form.elements[input.name+".cancel"]
    if (input.changed || input.modal) return;
    form.modal = true
    input.modal = true
    input.old_value = input.value;
    confirmButton.oldClassName = confirmButton.className;
    cancelButton.oldClassName = cancelButton.className;
    confirmButton.className = confirmButton.className + ' bg-primary';
    cancelButton.className = cancelButton.className + ' bg-primary'; 
    for (i = 0;i < form.elements.length;i++) {
        var element = form.elements[i]
        if (element != input && element != confirmButton && 
            element != cancelButton && !element.disabled &&
            element.className.indexOf("fieldset") == -1 &&
            element.type.indexOf("fieldset") == -1) {
            element.modal_disabled = element.disabled;
            element.disabled = true;
        } else {
            element.modal_disabled = null;
        }
    }
}
function modalInputChanged(input) {
    input.changed = true
}
function resetModalDisabled(form,input) {
    form.modal = false
    var confirmButton = form.elements[input.name+".confirm"];
    var cancelButton = form.elements[input.name+".cancel"];
    if (confirmButton.oldClassName) {
        confirmButton.className = confirmButton.oldClassName;        
    }
    if (cancelButton.oldClassName) {
        cancelButton.className = cancelButton.oldClassName;        
    }
    if (input != null)
        input.modal = false;
    for (i = 0;i < form.elements.length;i++) {
        var element = form.elements[i];
        if (element.modal_disabled != null)
            element.disabled = element.modal_disabled;
    }
}
function modalInputButtonFocused(button,name) {
    var form = button.form
    var input = form.elements[name]
    if (input.changed) return
    resetModalDisabled(form,input)
}
function cancelModalInputChange(button,name) {
    var form = button.form;
    var input = form.elements[name];
    if (!input.changed) 
        return;
    if (input.old_value) {
        input.value = input.old_value;        
    }    
    input.changed = false;
    resetModalDisabled(form,input);
}
function confirmModalInputChange(button,name,command) {
    var form = button.form;
    var input = form.elements[name];
    if (!input.changed) 
        return;
    form.modal = false;
    resetModalDisabled(form,input);
    submitForm(command);
}

function selezionaCondizione(riga) {
    document.mainForm.rigaSelezionata.value = riga;
    submitForm("doSelezionaCondizione");
}
function hideAlert(button) {
    var alertDiv = button.parentElement;
    alertDiv.parentElement.removeChild(alertDiv);
}
function inputFileName(element) {
    var filename = element.value.replace(/^.*\\/, "");
    document.getElementById('span-' + element.name).title = filename;
}

function restoreWorkspace() {            
}
function showMessage(level,img,text) {
}
function setFocusOnInput(inputName) {
    var input = document.mainForm.elements[inputName];
    if (input && !input.disabled && input.focus)
        input.focus();
}