$.internal_SliderFunctions = [];
if (!$.internal_SliderFunctions.SliderGroups)
{
    $.internal_SliderFunctions.SliderGroups =[]; // Array of all SliderControlObject arrays
}

$.internal_SliderFunctions.GroupFunctions =
{    
    Initialize : function (groupName)
    {
    },

    AddSliderControlGroup: function (groupName)
    {
        $.internal_SliderFunctions.SliderGroups[groupName] = ko.observableArray([]);
        return $.internal_SliderFunctions.SliderGroups[groupName];

    },
    AddSliderControlToGroup: function (groupName, slider)
    {
        var sliders = $.internal_SliderFunctions.GroupFunctions.GetSliderControls(groupName);
        sliders.push(slider);
    },
    GetSliderControlGroup: function (groupName)
    {
        return $.internal_SliderFunctions.SliderGroups[groupName];
    },
    GetSliderControls: function (groupName)
    {
               $.internal_SliderFunctions.GroupFunctions.GetSliderControlGroup('MyGroup')()
        return $.internal_SliderFunctions.GroupFunctions.GetSliderControlGroup(groupName)();

    },
    GetSliderControlByName: function (groupName, sliderName)
    {
        var sliders = $.internal_SliderFunctions.GroupFunctions.GetSliderControls(groupName);
        return  ko.utils.arrayFirst(sliders, function (item)
        {
            return sliderName === item.SliderName;
        });
    },
    GetSliderControlById: function (groupName, sliderId)
    {
        var sliders = $.internal_SliderFunctions.GroupFunctions.GetSliderControls(groupName);
        return  ko.utils.arrayFirst(sliders, function (item)
        {
            return sliderId === item.SliderId;
        });
    },
    ActivateAllSliders: function (groupName)
    {
        // Note: sliders must be activated after KO is bound
        var sliders = $.internal_SliderFunctions.GroupFunctions.GetSliderControls(groupName);
        for (var slider in sliders)
        {
            sliders[slider].ActivateSlider();
        }
    },
    ReActivateAllSliders : function (groupName)
    {
        var sliders = $.internal_SliderFunctions.GroupFunctions.GetSliderControls(groupName);
        for (var slider in sliders)
        {
            sliders[slider].ReActivateSlider();
        }
    },
    RemoveAllSliders: function (groupName)
    {
        // Destroys the slider and removes it from the DOM
        var sliders = $.internal_SliderFunctions.GroupFunctions.GetSliderControlGroup(groupName);
        while (sliders().length > 0)
        {
            $.internal_SliderFunctions.GroupFunctions.RemoveSlider(groupName, sliders()[0]);
        }
    },
    RemoveSlider: function (groupName, slider)
    {
        // Destroys the slider and removes it from the DOM
        var sliders = $.internal_SliderFunctions.GroupFunctions.GetSliderControlGroup(groupName);
        if (slider && slider.Slider)
        {
            slider.DeActivateSlider();
            slider.Slider = null;
        }
        // remove the DIV by removing the pile.  ko will remove it.
        sliders.remove(slider);
    },
    RemoveSliderByName: function (groupName, sliderName)
    {
        var slider = $.internal_SliderFunctions.GroupFunctions.GetSliderControlByName(groupName, sliderName);
        $.internal_SliderFunctions.GroupFunctions.RemoveSlider(groupName, slider);
    },
    RemoveSliderById: function (groupName, sliderId)
    {
        var slider = $.internal_SliderFunctions.GroupFunctions.GetSliderControlById(groupName, sliderId);
        $.internal_SliderFunctions.GroupFunctions.RemoveSlider(groupName, slider);
    },
    AddImageToSlider : function(groupName, sliderName, imageObject, position)
    {
        var sliderControls = $.internal_SliderFunctions.GroupFunctions.GetSliderControlGroup(groupName);
        var sliderControl = $.internal_SliderFunctions.GroupFunctions.GetSliderControlByName(groupName, sliderName);

        if (sliderControl)
        {
            var sliderPosition = sliderControls.indexOf(sliderControl);
            sliderControls.remove(sliderControl);
            sliderControl.DeActivateSlider();
            sliderControl.ImageObjectArray.splice(position,0,imageObject);
            sliderControls.splice(sliderPosition,0,sliderControl);
            sliderControl.ActivateSlider();
        }
        return sliderControl;
    },
    RemoveImageFromSlider: function (groupName, sliderName, imageObject)
    {
        var sliderControls = $.internal_SliderFunctions.GroupFunctions.GetSliderControlGroup(groupName);
        var sliderControl = $.internal_SliderFunctions.GroupFunctions.GetSliderControlByName(groupName, sliderName);

        if (sliderControl)
        {
            var sliderPosition = sliderControls.indexOf(sliderControl);
            sliderControls.remove(sliderControl);
            sliderControl.DeActivateSlider();
            sliderControl.ImageObjectArray.remove(imageObject);
//            $.internal_SliderFunctions.GroupFunctions.MaintainImageList(sliderControl);
            sliderControls.splice(sliderPosition, 0, sliderControl);
            sliderControl.ActivateSlider();
        }
    },
    MaintainImageList: function (sliderControl)
    {
        images = sliderControl.ImageObjectArray();
        minimumCount = sliderControl.Slides;
        // Remove empty images
        for (var index = images.length; index > 0 ; index--)
        {
            if (images[index-1].Options['Source'] === 'Empty')
            {
                images.splice(index-1, 1);
            }
        }

        // Add empty images to the end to meet the minimum slider image count .
        for (var index = images.length; index < minimumCount; index++)
        {
            var image = new $.internal_SliderFunctions.SliderImageObject();
            image.Options["Source"] = 'Empty';
            image.Options["SliderName"] = '';
            image.Url = sliderControl.EmptyImageUrl;
            image.ImageIndex = index;

            images.push(image);
        }
        // Reindex
        for (var index = 0; index < images.length ; index++)
        {
            images[index].ImageIndex = index;
        }
    }
}

$.internal_SliderFunctions.SliderControlObject = function ()
{
    var self = this;
    self.Options = []; //Any options not related to the slider that we want to access inside events
    $.internal_sliderInterface = ($.internal_sliderInterface || 0) + 1;
    self.sliderInterfaceNumber = $.internal_sliderInterface;
    self.SliderId = 0; //dat.CardPileId || 0;
    self.SliderName = 'Slider1'; //deckName;
    self.DisplayName = 'Slider1';  //self.FriendlyDeckName(deckName);
    self.EmptyImageUrl = undefined;
    self.ModifyingLayout = ko.observable(false); // self.ModifyingLayout;
    self.Image_MouseOverAction = undefined; //self.NewImageUnderMouse;
    self.Image_MouseDownAction = undefined; //self.ImageUnderMouseDown;
    self.Image_MouseUpAction = undefined; //self.ImageUnderMouseUp;
    self.OnImageClick = undefined;
    self.NormalImageWidth = undefined; // Combines with ScalePercent to override the picture width
    self.NormalImageHeight = undefined; // Combines with ScalePercent to override the picture height
    self.ScalePercent = undefined; //dat.Size; // Number (percent) to scale the image to against a 100 by 140 image
    self.Positioning = 'relative';
    self.Top = undefined; // Where to move the slider
    self.Left = undefined;  // Where to move the slider
    self.SliderWidth = 500; // How wide the whole slider is
    self.SliderHeight = 110; // How high the whole slider is
    self.SlideSpacing = 3; // Space between each slide
    self.DisplayPieces = 5; //DisplayPieces;
    self.PlayOrientation = 1; //PlayOrientation;
    self.ScrollSteps = 2; //How many images to scroll with each movement;
    self.ImageObjectArray = ko.observableArray([]);
    self.ImageObjectArray.subscribe(function (newValue)
    {
        $.internal_SliderFunctions.GroupFunctions.MaintainImageList(self);
    }, self);

    Object.defineProperty
        (self, "LeftPx",
            {
                get: function ()
                {
                    if (self.Left)
                    {
                        // Return as a px string
                        return self.Left + 'px';
                    }
                    return undefined;
                }
            }
        );

    Object.defineProperty
        (self, "TopPx",
            {
                get: function ()
                {
                    if (self.Top)
                    {
                        // Return as a px string
                        return self.Top + 'px';
                    }
                    return undefined;
                }
            }
        );

    Object.defineProperty
        (self, "DivName",
            {
                get: function ()
                {
                    var name = "S" + self.sliderInterfaceNumber + "_" + self.SliderName.replace(/[^a-zA-Z0-9 ]/g, "");
                    return name;
                }
            }
        );


    Object.defineProperty
        (self, "SliderWidthPx",
            {
                get: function ()
                {
                    return self.SliderWidth + 'px';
                }
            }
        );


    Object.defineProperty
        (self, "SliderHeightPx",
            {
                get: function ()
                {
                    return self.SliderHeight + 'px';
                }
            }
        );

    Object.defineProperty
        (self, "PictureHeight",
            {
                get: function ()
                {
                    if (self.NormalImageHeight && self.ScalePercent)
                    {
                        return (Math.floor((self.NormalImageHeight * (self.ScalePercent || 100)) / 100));
                    }
                    return undefined;
                }
            }
        );

    Object.defineProperty
        (self, "PictureWidth",
            {
                get: function ()
                {
                    if (self.NormalImageWidth && self.ScalePercent)
                    {
                        return (Math.floor((self.NormalImageWidth * (self.ScalePercent || 100)) / 100));
                    }
                    return undefined;
                }
            }
        );

    Object.defineProperty
        (self, "Slides",
            {
                get: function ()
                {
                    if (self.SliderWidth && self.PictureWidth)
                    {
                        return Math.ceil(self.SliderWidth / self.PictureWidth); // Determine how many pictures fit in the area
                    }
                    else
                    {
                        return self.DisplayPieces;
                    }
                }
            }
        );

    self.ImageObjectArray.subscribe(function (newValue)
    {
       // Do we need to update the slider?
    }, self);

    self.BuildSliderOptionsObject = function ()
    {   // Set up the Options object for a slider
        var dragOrientation = (self.ScrollSteps == 0) ? 0 : self.PlayOrientation || 1; //0=none  1=horizontal, 2=vertical
        var chanceToShowBullets = (self.ScrollSteps == 0) ? 0 : 2;
        var chanceToShowArrows = (self.ScrollSteps == 0 || self.DisplayPieces < 4) ? 0 : 1;
        var scrollSteps = self.ScrollSteps || 1; // Prevent error if value is 0
        var options = {
            $SlideDuration: 300,                   //[Optional] Specifies default duration (swipe) for slide in milliseconds, default value is 500
            $FillMode: 1,                          // optional  0  The way to fill image in slide, 0: stretch, 1: contain (keep aspect ratio and put all inside slide), 2: cover (keep aspect ratio and cover whole slide), 4: actual size, 5: contain for large image and actual size for small image, default value is 0  
            $MinDragOffsetToSlide: 20,             //[Optional] Minimum drag offset to trigger slide , default value is 20
            $SlideSpacing: self.SlideSpacing, 					   //[Optional] Space between each slide in pixels, default value is 0
            $ParkingPosition: 0,                   //[Optional] The offset position to park slide (this options applys only when slideshow disabled), default value is 0.
            $ArrowKeyNavigation: false,            //  optional  false  Allows keyboard (arrow key) navigation or not  
            $DisplayPieces: self.DisplayPieces,           //[Optional] Number of pieces to display (the slideshow would be disabled if the value is set to greater than 1), the default value is 1
            $UISearchMode: 1,                      //[Optional] The way (0 parellel, 1 recursive, default value is 1) to search UI components (slides container, loading screen, navigator container, arrow navigator container, thumbnail navigator container etc).
            $PlayOrientation: self.PlayOrientation,         //[Optional] Orientation to play slide (for auto play, navigation), 1 horizental, 2 vertical, default value is 1
            $DragOrientation: dragOrientation,        //[Optional] Orientation to drag slide, 0 no drag, 1 horizental, 2 vertical, 3 either, default value is 1 (Note that the $DragOrientation should be the same as $PlayOrientation when $DisplayPieces is greater than 1, or parking position is not 0)
            $BulletNavigatorOptions: {             //[Optional] Options to specify and enable navigator or not
                $Class: $JssorBulletNavigator$,    //[Required] Class to create navigator instance
                $ChanceToShow: chanceToShowBullets,                  //[Required] 0 Never, 1 Mouse Over, 2 Always
                $AutoCenter: 0,                    //[Optional] Auto center navigator in parent container, 0 None, 1 Horizontal, 2 Vertical, 3 Both, default value is 0
                $Steps: scrollSteps,                         //[Optional] Steps to go for each navigation request, default value is 1
                $Lanes: 1,                         //[Optional] Specify lanes to arrange items, default value is 1
                $SpacingX: 0,                      //[Optional] Horizontal space between each item in pixel, default value is 0
                $SpacingY: 0,                      //[Optional] Vertical space between each item in pixel, default value is 0
                $Orientation: self.PlayOrientation          //[Optional] The orientation of the navigator, 1 horizontal, 2 vertical, default value is 1
            },

            $ArrowNavigatorOptions: {
                $Class: $JssorArrowNavigator$,     //[Required] Class to create arrow navigator instance
                $ChanceToShow: chanceToShowArrows,                  //[Required] 0 Never, 1 Mouse Over, 2 Always
                $AutoCenter: 0,                    //[Optional] Auto center navigator in parent container, 0 None, 1 Horizontal, 2 Vertical, 3 Both, default value is 0
                $Steps: 1
            }
        };
        if (self.SliderWidth && self.DisplayPieces)
        {
            options.$SlideWidth = Math.floor(self.SliderWidth / self.DisplayPieces)
                                 - (self.SlideSpacing * (self.DisplayPieces - 1));
        }
        if (self.PictureWidth) options.$SlideWidth = Number(self.PictureWidth); //[Optional] Width of every slide in pixels, default value is width of 'slides' container
        if (self.PictureHeight) options.$SlideHeight = Number(self.PictureHeight); //[Optional] Height of every slide in pixels, default value is height of 'slides' container

        return options;
    };

    self.InternalImageClick = function (data, event)
    {
        if (self.OnImageClick)
        {
            var target = $(event.currentTarget);
            var imageIndex = Number(target.children('img').attr('data-imageindex'));
            var sliderId = Number(target.closest('.ImageSliderDiv').attr('data-SliderId'));
            var sliderName = target.closest('.ImageSliderDiv').attr('data-slidername');

            var imageObject =
            ko.utils.arrayFirst(self.ImageObjectArray(), function (item)
            {
                return imageIndex === item.ImageIndex;
            });

            self.OnImageClick(data, event, target, imageIndex, sliderId, sliderName, imageObject);
        };
    };

    self.MouseOverAction = function (data, event)
    {
        if (self.Image_MouseOverAction)
        {
            var target = $(event.currentTarget);
            var imageIndex = Number(target.attr('data-imageindex'));
            var sliderId = Number(target.closest('.ImageSliderDiv').attr('data-SliderId'));
            var sliderName = target.closest('.ImageSliderDiv').attr('data-slidername');

            var imageObject =
            ko.utils.arrayFirst(self.ImageObjectArray(), function (item)
            {
                return imageIndex === item.ImageIndex;
            });

            self.Image_MouseOverAction(data, event, target, imageIndex, sliderId, sliderName, imageObject);
        };
    };

    self.MouseUpAction = function (data, event)
    {
        if (self.Image_MouseUpAction)
        {
            var target = $(event.currentTarget);
            var imageIndex = Number(target.attr('data-imageindex'));
            var sliderId = Number(target.closest('.ImageSliderDiv').attr('data-SliderId'));
            var sliderName = target.closest('.ImageSliderDiv').attr('data-slidername');

            var imageObject =
            ko.utils.arrayFirst(self.ImageObjectArray(), function (item)
            {
                return imageIndex === item.ImageIndex;
            });

            self.Image_MouseUpAction(data, event, target, imageIndex, sliderId, sliderName, imageObject);
        };
    };

    self.MouseDownAction = function (data, event)
    {
        if (self.Image_MouseDownAction)
        {
            var target = $(event.currentTarget);
            var imageIndex = Number(target.attr('data-imageindex'));
            var sliderId = Number(target.closest('.ImageSliderDiv').attr('data-SliderId'));
            var sliderName = target.closest('.ImageSliderDiv').attr('data-slidername');

            var imageObject =
            ko.utils.arrayFirst(self.ImageObjectArray(), function (item)
            {
                return imageIndex === item.ImageIndex;
            });

            self.Image_MouseDownAction(data, event, target, imageIndex, sliderId, sliderName, imageObject);
        };
    };

    self.ActivateSlider = function ()
    {
        self.Slider = null;

        var slider = new $JssorSlider$(self.DivName, self.BuildSliderOptionsObject());
        slider.$On($JssorSlider$.$EVT_CLICK, self.InternalImageClick);
        self.Slider = slider; // Save a reference to the slider
        slider.$GoTo(0); // Make sure slide 0 is the active slide
    };

    self.ReActivateSlider = function ()
    {   // Removes the slider and recreates it.
        self.DeActivateSlider();
        self.Slider = self.ActivateSlider();
    };

    self.DeActivateSlider = function ()
    {   // Removes the slider.
        if ($(self.Slider.$Elmt))
        {
            $(self.Slider.$Elmt).remove();
        }
    };
};

$.internal_SliderFunctions.DetermineTop = function (topPX, element, positioning)
{
    if (positioning === 'relative')
    {

    }
    if (positioning === 'absolute')
    {
        if (topPX)
        {
            return topPX;
        }
        return $(element).position().top + 'px';
    }

}

$.internal_SliderFunctions.DetermineLeft = function (leftPX, element, positioning)
{
    if (positioning === 'relative')
    {

    }
    if (positioning === 'absolute')
    {
        if (leftPX)
        {
            return leftPX;
        }
        return $(element).position().left + 'px';
    }
}

$.internal_SliderFunctions.SliderImageObject = function ()
{
    var self = this;
    self.Options = [];
    self.Url = undefined;
    self.ImageIndex = undefined;
};

window.$sgf = $.internal_SliderFunctions.GroupFunctions;

(function ($)
{
    $.extend($.fn, {
        sliderInterface: function (options)
        {
            options = $.extend({
                // Options Defaults
            }, options);
            // For each item in the jquery selection, insert the html/markup for the slider 
            this.each(function ()
            {
                var dataString = " " +
                "                                                                                                                                                                              " +
                "   <div class='item-wrapper'                                                                                                                                                  " +
                "        data-bind='css: { isDraggable: $data.ModifyingLayout, boldBorder: $data.ModifyingLayout },                                                                            " +
                "                   style: {                                                                                                                                                   " +
                "                   position: $data.Positioning,                                                                                                " +
                "                   top: $.internal_SliderFunctions.DetermineTop($data.TopPx, $element, $data.Positioning),                                                                                                " +
                "                   left: $.internal_SliderFunctions.DetermineLeft($data.LeftPx, $element, $data.Positioning),                                                                                             " +
                "                   width: $data.SliderWidthPx,                                                                                                                                " +
                "                   height: $data.SliderHeightPx }'                                                                                                                            " +
                "        style='overflow: hidden;'>                                                                                                                        " +
                "       <span class='SliderDeckText' data-bind='text: $data.DisplayName' ></span>                                                                                              " +
                "       <div class='item-container' data-bind='visible: !$data.ModifyingLayout()'>                                                                                             " +
                "            <div data-bind='attr: {id: $data.DivName}, style: {width: $data.SliderWidthPx, height: $data.SliderHeightPx}' style='overflow: hidden;'>                          " +
                "                 <div class='ImageSliderDiv' u='slides'                                                                                                                       " +
                "                      data-bind=\"                                                                                                                                            " +
                "                               attr: { 'data-slidername': $data.SliderName, 'data-SliderId': $data.SliderId },                                                                " +
                "                               style: { width: $data.SliderWidthPx, height: $data.SliderHeightPx },                                                                           " +
                "                               foreach: $data.ImageObjectArray\"                                                                                                              " +
                "                       style='position: absolute; left: 0px; top: 0px; overflow: hidden;'>                                                                                    " +
                "                      <div>                                                                                                                                                   " +
                "                           <img class='Card' u='image' data-bind=\"                                                                                                           " +
                "                               event: { mouseenter: $parent.MouseOverAction, mousedown: $parent.MouseDownAction, mouseup: $parent.MouseUpAction },                            " +
                "                               attr: { 'data-imageIndex': $data.ImageIndex, src: $data.Url }\" src='./Images/Card1.jpg' />                                                     " +
                "                      </div>                                                                                                                                                  " +
                "                 </div>                                                                                                                                                       " +
                "                 <!-- bullet navigator container -->                                                                                                                          " +
                "                 <div u='navigator' class='jssorb03' style='position: absolute; bottom: 4px; right: 6px;'>                                                                    " +
                "                     <!-- bullet navigator item prototype -->                                                                                                                 " +
                "                     <div u='prototype' style='position: absolute; width: 21px; height: 21px; text-align:center; line-height:21px; color:white; font-size:12px;'>             " +
                "                         <numbertemplate></numbertemplate>                                                                                                                    " +
                "                     </div>                                                                                                                                                   " +
                "                 </div>                                                                                                                                                       " +
                "                 <!-- Bullet Navigator End -->                                                                                                                                " +
                "                 <!-- Arrow Left -->                                                                                                                                          " +
                "                 <span u='arrowleft' class='jssora03l' data-bind=\"style: {height: 50 + 'px', width: 25 + 'px'}\"                                                             " +
                "                     style='top: 0px; left: 1px;'></span>                                                                                                                     " +
                "                 <!-- Arrow Right -->                                                                                                                                         " +
                "                 <span u='arrowright' class='jssora03r' data-bind=\"style: {height: 50 + 'px', width: 25 + 'px'}\"                                                            " +
                "                     style='top: 0px; right: 8px'></span>                                                                                                                     " +
                "                 <!-- Arrow Navigator Skin End -->                                                                                                                            " +
                "                 <a style='display: none' href='http://www.jssor.com'>Slider</a>                                                                                              " +
                "            </div>                                                                                                                                                            " +
                "       </div>                                                                                                                                                                 " +
                "   </div>                                                                                                                                                                     " +
    "                       ";

                // Operations for each DOM element
                $(this).append(dataString);

            }).data('sliderInterface', {
                // Plugin interface object
            });

            return this;
        }
    });
})(jQuery);
