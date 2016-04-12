var CommonFunctions = [];

CommonFunctions.GetColumnDefinition = function (columnDefinition)
{   // Creates a column definition that the koGrid can use.

    // column definition Values are <column-name>:<column-title>[:property-name=value][:property-name=value]...
    // Sample: AddDate:Added:minWidth=50:width=60*:cellFilter=(function(data) { return data.yyyymmdd; })"
    var coldef = {};
    coldef['optionsText'] = '';
    coldef['optionsValue'] = '';

    var colData = (columnDefinition || "").split(":");
    for (var index = 0; index < colData.length; index++)
    {
        var data = colData[index].split("=");
        if (data.length > 1)
        {
            if (data[0] == 'TemplateType')
            {
                coldef['cellTemplate'] = CommonFunctions.GetCellDefinitionType(data[1]);
            }
            else if (data[1].indexOf('(') == 0)
            {
                coldef[data[0]] = eval(data[1]);
            }
            else
            {
                coldef[data[0]] = data[1];
            }
        }
    }

    return coldef;
};

CommonFunctions.GetCellDefinitionType = function(templateType)
{   // Returns the template string for the given template type.
    var result='';
    switch (templateType)
    {
        case 'checkbox':
            result = "<input type = 'checkbox' data-bind=\"attr: { 'class': 'kgCellText colt' + $index()}, checked: $data.getProperty($parent)\"/>";
            break;
    }
    return result;
};

CommonFunctions.ApplyRules = function (source, data, parent, d)
{   // Applies properties contained in a column definition to the source control.

    for (var hasProperties in data) break;
    if (!hasProperties || hasProperties=="0")
    {
        data = CommonFunctions.GetColumnDefinition(data);
    }
    
    for (var key in data)
    {
        var keyType = '';

        switch(key)
        {
            case "optionsText", "optionsValue", "field", "typeName", "displayName", "cellTemplate", "TemplateType":
                // ignore values we know are not properties to be set.
                keyType = 'none';
                break;
            case 'title':
                // These may not show as a property of a control but they probably should.
                keyType = 'source';
                break;
            default:
                if (source[key])
                {
                    keyType = 'source';
                }
                else
                {
                    // Not sure what to do with it.  We can set it as a css property.
                    keyType = 'css';
                }
                break;
        }
        switch(keyType)
        {
            case 'source':
                source[key] = data[key];
                break;
            case 'css':
                $(source).css(key, data[key]);
                break;
        }
    }
};

CommonFunctions.MapListToObservable = function (valuesArray, destArray, arrayName, context)
{   // Takes an object with properties, and adds them to a destination array as an observable (or updates the observable if it exists already)
    for (var key in valuesArray)
    {
        if (!destArray[key])
        {
            destArray[key] = ko.observable(valuesArray[key]);
            // We have to create the function as a string and "eval" it, otherwise a single static instance will get created.
            var x = "function (newValue) { this.FilterValueChanged(newValue, '" + key + "','" + arrayName + "') };";
            destArray[key].subscribe(eval("false||" + x), context);
        }
        else
        {
            destArray[key](valuesArray[key]);
        }
    }
};

CommonFunctions.MapListToObservableArray = function (valuesArray, destArray, arrayName, context)
{   // Takes an object with properties of arrays, and adds them to a destination array as an observable array (or updates it if it exists already)
    for (var key in valuesArray)
    {
        if (!destArray[key])
        {
            destArray[key] = ko.observableArray(valuesArray[key]);
            // We have to create the function as a string and "eval" it, otherwise a single static instance will get created.
            var x = "function (newValue) { this.FilterValueChanged(newValue, '" + key + "','" + arrayName + "') };";
            destArray[key].subscribe(eval("false||" + x), context);
        }
        else
        {
            destArray[key](valuesArray[key]);
        }
    }
};

CommonFunctions.AddEmpty = function (arrayToChange)
{   // Adds an empty array item to the start of the array.

    arrayToChange.unshift("");
    return arrayToChange;
};

CommonFunctions.ClearObservables = function (self)
{   // Loops through the object and clears any observable arrays (using removeAll)
    // so the memory can be garbage collected.

    for (var key in self)
    {
        if (ko.isObservable(self[key]))
        {
            if (self[key].removeAll)
            {
                try
                {
                    self[key].removeAll();
                }
                catch (er)
                {
                    // Not sure why, but sometimes removeAll throws an error that "slice" is not valid.
                }
            }
        }
    }
}

CommonFunctions.DisposeObjects = function (self)
{   // Loops through the object and disposes of any objects in it with a dispose command on it.
    // and deletes everything so the memory can be garbage collected.

    for (var key in self)
    {
        if (ko.isObservable(self[key]) && !self[key].removeAll)
        {
            if (self[key].dispose)
            {
                self[key].dispose();
            }
            else
            {
                self[key](null);
            }
        }
        delete self[key];
        self[key] = null;
    }
}

function SetScreenSize(width)
{
    width = parseInt(width, 10);
    mpvm.ScreenWidth(width);
    $.ajax({
        type: "POST",
        data: { width: width },
        url: "Default/SetScreenSize",
        dataType: "json",
        success: function (result)
        {
            if (result * .95 > width || result * 1.05 < width)
            {
                //                  __doPostBack('', '');
            }
        },
        error: function (result)
        {
            alert("error: SetScreenSize failed: " + result);
        }
    });

    //            if (width < 701)
    //            {
    //                $("#size-stylesheet").attr("href", "css/narrow.css");
    //            } else if ((width >= 701) && (width < 900))
    //            {
    //                $("#size-stylesheet").attr("href", "css/medium.css");
    //            } else
    //            {
    //                $("#size-stylesheet").attr("href", "css/wide.css");
    //            }
5}

// Function to call when the screen size changes.
$(function ()
{
    SetScreenSize($(this).width());
    $(window).resize(function ()
    {
        SetScreenSize($(this).width());
    });
});


/*!
* jQuery.parseJSON() extension (supports ISO & Asp.net date conversion)
*
* Version 1.0 (13 Jan 2011)
*
* Copyright (c) 2011 Robert Koritnik
* Licensed under the terms of the MIT license
* http://www.opensource.org/licenses/mit-license.php
*/
(function ($)
{

    // JSON RegExp
    var rvalidchars = /^[\],:{}\s]*$/;
    var rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
    var rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
    var rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g;
    var dateISO = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:[.,]\d+)?Z/i;
    var dateNet = /\/Date\((\d+)(?:-\d+)?\)\//i;

    // replacer RegExp
    var replaceISO = /"(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:[.,](\d+))?Z"/i;
    var replaceNet = /"\\\/Date\((\d+)(?:-\d+)?\)\\\/"/i;

    // determine JSON native support
    var nativeJSON = (window.JSON && window.JSON.parse) ? true : false;
    var extendedJSON = nativeJSON && window.JSON.parse('{"x":9}', function (k, v) { return "Y"; }) === "Y";

    var jsonDateConverter = function (key, value)
    {
        if (typeof (value) === "string")
        {
            if (dateISO.test(value))
            {
                return new Date(value);
            }
            if (dateNet.test(value))
            {
                return new Date(parseInt(dateNet.exec(value)[1], 10));
            }
        }
        return value;
    };

    $.extend({
        parseJSON: function (data, convertDates)
        {
            /// <summary>Takes a well-formed JSON string and returns the resulting JavaScript object.</summary>
            /// <param name="data" type="String">The JSON string to parse.</param>
            /// <param name="convertDates" optional="true" type="Boolean">Set to true when you want ISO/Asp.net dates to be auto-converted to dates.</param>

            convertDates = convertDates === false ? false : true;

            if (typeof data !== "string" || !data)
            {
                return null;
            }

            // Make sure leading/trailing whitespace is removed (IE can't handle it)
            data = $.trim(data);

            // Make sure the incoming data is actual JSON
            // Logic borrowed from http://json.org/json2.js
            if (rvalidchars.test(data
          .replace(rvalidescape, "@")
          .replace(rvalidtokens, "]")
          .replace(rvalidbraces, "")))
            {
                // Try to use the native JSON parser
                if (extendedJSON || (nativeJSON && convertDates !== true))
                {
                    return window.JSON.parse(data, convertDates === true ? jsonDateConverter : undefined);
                }
                else
                {
                    data = convertDates === true ?
                  data.replace(replaceISO, "new Date(parseInt('$1',10),parseInt('$2',10)-1,parseInt('$3',10),parseInt('$4',10),parseInt('$5',10),parseInt('$6',10),(function(s){return parseInt(s,10)||0;})('$7'))")
                      .replace(replaceNet, "new Date($1)") :
                  data;
                    return (new Function("return " + data))();
                }
            } else
            {
                $.error("Invalid JSON: " + data);
            }
        }
    });
})(jQuery);


FormatDate_yyyymmdd = function (dateValue)
{
    if (!dateValue)
    {
        return "";
    }
    var yyyy = dateValue.getFullYear().toString();
    var mm = (dateValue.getMonth() + 1).toString(); // getMonth() is zero-based
    var dd = dateValue.getDate().toString();
    return yyyy + (mm[1] ? mm : "0" + mm[0]) + (dd[1] ? dd : "0" + dd[0]); // padding
}

FormatDate_yyyymmddSlashes = function (dateValue)
{   // Formats a date with slashes yyyy/mm/dd
    if (!dateValue)
    {
        return "";
    }
    var yyyy = dateValue.getFullYear().toString();
    var mm = (dateValue.getMonth() + 1).toString(); // getMonth() is zero-based
    var dd = dateValue.getDate().toString();
    return yyyy + '/' + (mm[1] ? mm : "0" + mm[0]) + '/' + (dd[1] ? dd : "0" + dd[0]); // padding
}

Date.prototype.yyyymmdd = function ()
{
    return FormatDate_yyyymmdd(this);
};

Date.prototype.yyyymmddSlashes = function ()
{
    return FormatDate_yyyymmddSlashes(this);
};

$.ajaxSetup({
    converters: {
        'text json': $.parseJSON
    }
});

ko.bindingHandlers.onEnter = {
    init: function (element, valueAccessor, _, viewModel)
    {
        ko.utils.registerEventHandler(element, 'keydown', function (evt)
        {
            if (evt.keyCode === 13)
            {
                element.blur();
                valueAccessor().call(viewModel);
            }
        });
    }
}

ko.bindingHandlers.datepicker = {
    // Allow datepicker to work even if the date is null.
    init: function (element, valueAccessor, allBindingsAccessor)
    {
        //initialize datepicker with some optional options
        var options = allBindingsAccessor().datepickerOptions || {};
        $(element).datepicker(options);

        //handle the field changing
        ko.utils.registerEventHandler(element, "change", function ()
        {
            var observable = valueAccessor();
            observable($(element).datepicker("getDate"));
        });

        //handle disposal (if KO removes by the template binding)
        ko.utils.domNodeDisposal.addDisposeCallback(element, function ()
        {
            $(element).datepicker("destroy");
        });

    },
    //update the control when the view model changes
    update: function (element, valueAccessor)
    {
        var value = ko.utils.unwrapObservable(valueAccessor());
        $(element).datepicker("setDate", value);
    }
};

ko.bindingHandlers.slider = {
    init: function (element, valueAccessor, allBindingsAccessor)
    {
        var options = allBindingsAccessor().sliderOptions || {};
        $(element).slider(options);
        ko.utils.registerEventHandler(element, "slidechange", function (event, ui)
        {
            var observable = valueAccessor();
            observable(ui.value);
        });
        ko.utils.domNodeDisposal.addDisposeCallback(element, function ()
        {
            $(element).slider("destroy");
        });
        ko.utils.registerEventHandler(element, "slide", function (event, ui)
        {
            var observable = valueAccessor();
            observable(ui.value);
        });
    },
    update: function (element, valueAccessor, allBindingsAccessor)
    {
        var value = ko.utils.unwrapObservable(valueAccessor());
        if (isNaN(value)) value = 0;
        $(element).slider("value", value);
        $(element).slider("option", allBindingsAccessor().sliderOptions);

    }
};


CommonFunctions.InsertFakeCardObjectIntoList = function (cardsList, cardId, name, imageSource)
{
    var card = {
        Id: cardId,
        Name: name,
        Description: name,
        IsMemberOwned: 0,
        ScriptureReference: name,
        OriginalDeckId: 0,
        CardTypeId: 0,
        RarityId: 0,
        ColorId: 0,
        PointCost: 0,
        AttackValue: 0,
        DefenseValue: 0,
        Special: name,
        Notes: 0,
        ScriptureText: name,
        imageSource: imageSource
    };
    cardsList[cardId] = card;
};

