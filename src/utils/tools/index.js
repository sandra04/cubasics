// FORMS

// Check text length
export function checkLengthEnough(valueToCheck, minText) {
    if (valueToCheck.length < minText) return false
    else return true
}


export function checkIsSecurized(valueToCheck){
    const numberRegex = /[0-9]/
    const lowercaseRegex = /[a-z]/
    const uppercaseRegex = /[A-Z]/
    const specialRegex = /[^A-Za-z0-9]/

    const lengthEnough = checkLengthEnough(valueToCheck, 8)
    if (lengthEnough &&  valueToCheck.match(numberRegex) && valueToCheck.match(lowercaseRegex) && valueToCheck.match(uppercaseRegex) && valueToCheck.match(specialRegex)){
        return true
    }
    else return false    
}


// Check which checkboxes are selected
export function sendCheckboxSelected(listOfCheckboxes) {
    if(listOfCheckboxes.length === 0 || !listOfCheckboxes) return []
    else {
        let selectedItems = []
        listOfCheckboxes.forEach((checkbox) => {
            if (checkbox.checked){
                selectedItems.push(checkbox.value)
            }
        })
        return selectedItems
    }
}

// Check file type
export function validateIsGoodFormat(selectedFile, allowedTypes) {

         if (!allowedTypes.includes(selectedFile.type)) {
            return false
         }
         else{
            return true
         }
}

// Check file size
export function validateIsGoodSize(selectedFile, maxSize){
    const fileSize = selectedFile.size / 1024 / 1024; // in MiB
    
    if (fileSize > maxSize) {
       return false
    }
    else {
        return true
    }
}

// Format date (add zero in front of a number)
export function addZeroToNumber (testedNumber){
    if (testedNumber < 10) {
        const myNumber = "0" + testedNumber
        return myNumber
    }
    return testedNumber.toString()
}

// Format : yyyy-mm-dd hh:mm:ss
export function formatDate(dateToFormat) {
    const year = dateToFormat.getFullYear()
    const month = addZeroToNumber(dateToFormat.getMonth() + 1)
    const day = addZeroToNumber(dateToFormat.getDate())
    const hours = addZeroToNumber(dateToFormat.getHours())
    const minutes = addZeroToNumber(dateToFormat.getMinutes())
    const seconds = addZeroToNumber(dateToFormat.getSeconds())

    const currentDateFormatted = year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds
    return currentDateFormatted
}

export function formatStringDate(stringToFormat) {
    let formattedDate = stringToFormat.substring(0, 10)
    let hour = Number(stringToFormat.substring(11, 13)) + 1
    formattedDate = formattedDate + " à " + hour + stringToFormat.substring(13, 16)
    return formattedDate
}

export function encodeStringInput(stringToEncode){
    return stringToEncode.replace(/\\/g,"\\\\").replace(/\"/g,"\\\"");
}


// Clean text

export function cleanText(text){
    text = text.replaceAll(/[éèêë]/g, "e")
    .replaceAll(/[àâä]/g, "a")
    .replaceAll(/[ôö]/g, "o")
    .replaceAll(/[îï]/g, "i")
    .replaceAll(/[ûüù]/g, "u")
    .replaceAll("ç", "c")
    .replaceAll(" ", "_")
    return(text.toLowerCase())
}




// FILTER LIST

export function filterByMostViews(listToSort) {
    // Object.values() permet de copier le tableau souhaité
    // Sort() permet de classer les valeurs de la plus petite à la plus grande (ici, on classe par rapport au nombre de vues des posts)
    const filteredByViews = Object.values(listToSort).sort(function (a, b) {
        return a.views - b.views
    })
    const mostSeen = filteredByViews.reverse()
    return mostSeen
}

// Récupérer uniquement les n premiers éléments de la liste
export function selectFirstOnes (selection, maxItems) {
    let listToFilter =  Object.values(selection)
    if (selection.length <= maxItems) {
        return selection
    }
    else {
        while (listToFilter.length > maxItems) {
        listToFilter.pop()
        }
        return listToFilter
    }
}



// FETCH DATA

/*export function fetchData(url, dataToFetch, identify) {
    const headers = identify ? {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem('token')}`
    } :
    {
        "Content-Type": "application/json"
    }
    
    return (
        fetch(url, {
            method: "post",
            headers: headers,
            body: JSON.stringify(dataToFetch)
        })
    )  
}

export function fetchResult (res) {
    return {
        status: res.status + "-" + res.statusText,
        headers: {
            "Content-Type": res.headers.get("Content-Type"),
            "Content-Length": res.headers.get("Content-Length"),
        },
        data: res.json
    }
}*/