var SharedObj = {
    forms: new FormController(document.querySelectorAll('form')),
    modals: new ModalController(),
    navigation: new NavigationController(),
    menu: new MenuController(),
    HomePageSlider: new HomePageSlider(),
    ServicesToggleController: new ServicesToggleController(),
    ProductSlider: new ProductSlider(),
    Animate: new Animate(),
    Lazy: new LazyLoad(),
    Tabs: new Tabs(),
    Toggle: new Toggle(),
    // ToggleTabs: new ToggleTabs(),
    SlickArrows: new SlickArrows()
};


function FormController(forms) {
    forms.forEach(function(form) {
        new Form(form);
    });
}

function Form(form) {
    var self = this;
    this.controls = [];
    if (form) {
        this.form = form;

        form.querySelectorAll('input').forEach(function(input) {
            self.controls.push(new Input(input, self));
        });

        form.onsubmit = function(e) {
            e.preventDefault();
            var focusState = false;

            self.controls.forEach(function(ctrl) {
                if (!focusState) {
                    ctrl.input.focus();
                    if (!ctrl.validate()) {
                        focusState = true;
                    }
                }
            });

            var errors = self.controls.reduce(function(a, b) {
                b = b.valid ? 0 : 1;
                return a + b;
            }, 0);

            if (errors === 0) {
                SharedObj.modals.closeModal();
                self.controls.forEach(function(ctrl) {
                    ctrl.input.value = '';
                    ctrl.clear();
                })
            }
        };
    }
};

Form.prototype.validate = function() {
    this.controls.forEach(function(ctrl) {
        ctrl.validate()
    });
};

function Input(input, parent) {
    var self = this;
    this.parent = parent;
    this.msg = document.createElement('div');
    this.pattern = getPattern(input.getAttribute('data-pattern'));
    this.input = input;
    this.valid = false;
    this.value = input.value;
    input.oninput = function() {
        self.value = this.type === 'checkbox' ? this.checked : this.value;
        // self.parent.validate();
        self.validate();
    };
}

Input.prototype.validate = function() {
    if (this.input.getAttribute('data-pattern') === 'phone') {
        var val = this.input.value.replace(/[^0-9]/, '').replace(/ /g, '').replace(/\(/g, '').replace(/\)/g, '');
        if (this.pattern.test(val)) {
            this.removeError();
        } else {
            this.addError();
        }
    } else {
        if (
            (this.input.type === 'text' || this.input.type === 'password' || this.input.type === 'email') &&
            this.pattern.test(this.input.value) ||
            this.input.checked) {
            this.removeError();
        } else {
            this.addError();
        }
    }

    return this.valid;
};

Input.prototype.addError = function() {
    this.input.classList.add('invalid');
    this.input.classList.remove('valid');
    // this.msg.className = 'input-msg invalid';
    // this.msg.innerHTML = 'Enter the correct email';
    this.input.parentNode.appendChild(this.msg);
    this.valid = false;
};

Input.prototype.removeError = function() {
    this.input.classList.add('valid');
    this.input.classList.remove('invalid');
    // this.msg.className = 'input-msg valid';
    // this.msg.innerHTML = 'This is correct email';
    // this.input.parentNode.appendChild(this.msg);
    this.valid = true;
};

Input.prototype.clear = function() {
    this.input.classList.remove('valid');
    this.input.classList.remove('invalid');
    // this.input.parentNode.removeChild(this.msg);
    this.valid = false;
};

function getPattern(o) {
    var pattern;
    switch (o) {
        case 'email':
            pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            break;

        case 'login':
            pattern = /^(?=.*[A-Za-z0-9]$)[A-Za-z][A-Za-z\d.-]{0,19}$/;
            break;

        case 'password':
            pattern = /^(?=.*[a-zA-Z0-9])(?=.*).{7,40}$/;
            break;

        case 'phone':
            pattern = /^([0-9]){11,11}$/;
            break;

        case 'checkbox':
            pattern = /^on$/;
            break;
    }

    return pattern;
}


////////////////////
function ModalController() {
    var self = this;
    this.activeModal = undefined;
    this.modalOverlay = document.querySelector('#modal-overlay')

    var popupBtns = document.querySelectorAll('[data-modal-btn]');
    var closeBtns = document.querySelectorAll('[data-modal-close]');
    var activeModal;
    if (popupBtns.length) {
        popupBtns.forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                var id = e.currentTarget.getAttribute('data-modal-btn');
                e.stopPropagation();
                SharedObj.menu.hide();
                self.openModal(id);
            });
        });
    }

    if (closeBtns.length) {
        closeBtns.forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                self.activeModal.classList.remove('opened');
                self.modalOverlay.classList.remove('opened');
            });
        });
    }

    window.addEventListener('click', function(e) {
        if (self.activeModal && !self.activeModal.querySelector('.modal-body').contains(e.target)) {
            self.closeModal();
        }
    }, false);
}

ModalController.prototype.closeModal = function(e) {
    if (this.activeModal) {
        this.activeModal.classList.remove('opened');
        this.modalOverlay.classList.remove('opened');
        // document.body.style.overflow = '';
    }
}

ModalController.prototype.openModal = function(id) {
    // if (this.activeModal) {
    this.closeModal();
    this.modalOverlay.classList.add('opened');
    this.activeModal = document.querySelector('.modal[data-modal="' + id + '"]');
    this.activeModal.classList.add('opened');
    // document.body.style.overflow = 'hidden';
    // }
}


//

function isScrolledIntoView(elem, offsetVal) {
    var docViewTop = window.pageYOffset;
    var docViewBottom = docViewTop + window.innerHeight;
    var elemTop = offset(elem).top;
    var elemBottom = elemTop + elem.clientHeight;
    return docViewTop >= elemTop - (offsetVal || 200) /*- window.innerHeight*/ ; // /((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
};

function isInViewport(el, offset) {
    var top = el.offsetTop;
    var left = el.offsetLeft;
    var width = el.offsetWidth;
    var height = el.offsetHeight;

    while (el.offsetParent) {
        el = el.offsetParent;
        top += el.offsetTop;
        left += el.offsetLeft;
    }

    return (
        top < (window.pageYOffset + window.innerHeight - offset || 0) &&
        left < (window.pageXOffset + window.innerWidth) &&
        (top + height) > window.pageYOffset &&
        (left + width) > window.pageXOffset
    );
};

function offset(el) {
    var rect = el.getBoundingClientRect(),
        scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
        scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    return { top: rect.top + scrollTop, left: rect.left + scrollLeft }
}

function NavigationController() {
    var self = this;
    this.tabs = document.querySelectorAll('[data-navigation]');
    this.links = document.querySelectorAll('[data-navigation-link]');


    window.addEventListener('scroll', function() {
        self.tabs.forEach(function(elem) {
            if (isInViewport(elem, 300)) {
                var id = elem.getAttribute('data-navigation');
                self.links.forEach(function(link) {
                    if (link.getAttribute('data-navigation-link') === id) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            } else {
                self.links.forEach(function(link) {
                    link.classList.remove('active');
                });
            }
        });
    }, false);

    // $(this.links).on('click', function(e) {
    //     e.preventDefault();
    //     var id = this.getAttribute('data-navigation-link');
    //     var elem = document.querySelector('[data-navigation="' + id + '"]');
    //     var topOffset = this.getAttribute('data-navigation-offset');
    //     if (elem) {
    //         self.navigate(elem, topOffset);
    //     }

    // });
}


NavigationController.prototype.navigate = function(elem, topOffset) {
    var body = $("html, body");
    body.stop().animate({ scrollTop: offset(elem).top - (topOffset || 0) }, 500);
};


//


function MenuController() {
    var self = this;
    this.burger = document.querySelector('[data-burger]');
    this.sidebar = document.querySelector('.sidebar');
    this.closeBtn = document.querySelector('.sidebar__close');

    this.burger.addEventListener('click', function(e) {
        e.stopPropagation();
        if (self.burger.classList.contains('active')) {
            self.hide();
        } else {
            self.show();
        }

    }, false);

    this.closeBtn.addEventListener('click', function(e) {
        self.hide();
    });

    window.addEventListener('click', function(e) {
        if (!self.sidebar.contains(e.target)) {
            self.hide();
        }
    }, false);

};


MenuController.prototype.show = function() {
    this.burger.classList.add('active');
    this.sidebar.classList.add('active');
};

MenuController.prototype.hide = function() {
    this.burger.classList.remove('active');
    this.sidebar.classList.remove('active');
};



function HomePageSlider() {
    var self = this;
    this.slider = document.querySelector('[data-home-page-slider]');

    if (this.slider) {
        this.sliderInner = this.slider.querySelector('[data-home-page-slider-inner]');
        setTimeout(function(){
            self.update();
        }, 10);
        window.addEventListener('resize', function() {
            self.update();
        });

        if (this.slider) {
            this.slides = this.slider.querySelectorAll('[data-home-page-slider-item]');
            this.nextBtns = this.slider.querySelectorAll('[data-home-page-slider-next]');
            this.activeIndex = 0;

            this.nextBtns.forEach(function(btn){            
                btn.addEventListener('click', function(e) {
                    self.next();
                });
            });
        }
    }
};

HomePageSlider.prototype.next = function() {
    var self = this;

    this.activeIndex += 1;
    if (this.activeIndex > this.slides.length - 1) {
        this.activeIndex = 0;
    }

    this.position();
};

HomePageSlider.prototype.update = function() {
    if (this.sliderInner) {
        var windowWidth = (window.innerWidth <= 1920 ? window.innerWidth : 1920);
        this.sliderInner.style.width = this.slides.length * windowWidth + 'px';

        this.slides.forEach(function(slide, i) {
            slide.style.width = windowWidth + 'px';
        });

        this.position();
    }
};

HomePageSlider.prototype.position = function() {
    var self = this;
    var offset = -(this.activeIndex * window.innerWidth) + 'px';
    this.sliderInner.style.transform = 'translateX(' + offset + ')';
    this.slides.forEach(function(item, i) {
        if (i === self.activeIndex) {
            item.classList.add('active')
        } else {
            item.classList.remove('active');
        }
    });
};


SharedObj.HomePageSlider.update();


function ServicesToggleController() {
    var self = this;
    this.accoredon = document.querySelector('[data-service-accordeon]');
    this.toggleAll = document.querySelector('[data-service-accordeon-toggle-all]');
    var toggleAllStatus = false;
    if (this.accoredon) {
        this.items = this.accoredon.querySelectorAll('[data-service-accordeon-item]');
        this.items.forEach(function(mainItem) {
            var details = mainItem.querySelector('[data-service-accordeon-details]');
            var toggle = mainItem.querySelectorAll('[data-service-accordeon-toggle]');
            toggle.forEach(function(item) {
                item.addEventListener('click', function(e) {
                    if (mainItem.classList.contains('active')) {
                        mainItem.classList.remove('active');
                        $(details).slideUp();
                    } else {
                        mainItem.classList.add('active');
                        $(details).slideDown();
                    }
                })
            });

            var childToggle = mainItem.querySelectorAll('[data-service-accordeon-child-toggle]');
            childToggle.forEach(function(item) {
                item.addEventListener('click', function(e) {
                    if (item.classList.contains('active')) {
                        item.classList.remove('active');
                        $(item).next().slideUp();
                    } else {
                        item.classList.add('active');
                        $(item).next().slideDown();
                    }
                })
            });


        });

        this.toggleAll.addEventListener('click', function(e) {
            self.items.forEach(function(mainItem) {
                var details = mainItem.querySelector('[data-service-accordeon-details]');
                var toggle = mainItem.querySelectorAll('[data-service-accordeon-toggle]');
                if (!toggleAllStatus) {
                    mainItem.classList.add('active');
                    $(details).slideDown();
                } else {
                    mainItem.classList.remove('active');
                    $(details).slideUp();
                }
            });
            toggleAllStatus = !toggleAllStatus;
        });
    }
}

function ProductSlider() {
    var slider = document.querySelector('[data-product-slider]');
    if (slider) {
        var image = slider.querySelector('[data-product-img]');
        var items = slider.querySelectorAll('[data-product-thumb]');
        var prev = slider.querySelector('[data-product-prev]');
        var next = slider.querySelector('[data-product-next]');
        var curIndex = 0;
        items.forEach(function(item, index) {

            item.addEventListener('click', function(e) {
                curIndex = index;
                setActive();
            });
        });

        prev.addEventListener('click', function(e) {
            curIndex--;
            setActive();
        });

        next.addEventListener('click', function(e) {
            curIndex++;
            setActive();
        });

        function setActive() {
            if (curIndex < 0) {
                curIndex = items.length - 1;
            }
            if (curIndex >= items.length) {
                curIndex = 0;
            }
            items.forEach(function(item) {
                item.classList.remove('active');
            });
            items[curIndex].classList.add('active');
            var src = items[curIndex].getAttribute('data-product-thumb');
            image.src = src;
        }
    }
}

function Animate() {

    var elements = document.querySelectorAll('[data-animate]');

    setTimeout(function() {
        update();
        window.addEventListener('scroll', function() {
            update();
        });

        function update() {
            elements.forEach(function(elem) {
                if (isInViewport(elem, 100)) {
                    // if (isScrolledIntoView(elem, 700))  {
                    if (!elem.getAttribute('data-animate')) {
                        elem.setAttribute('data-animate', true);
                    }
                }
            });
        }
    }, 500);
}

function LazyLoad() {
    var elem = document.querySelector('[data-lazy-load]');
    var loader = document.querySelector('[data-lazy-load-loader]');
    var isLoading = false;
    var self = this;
    var timer;
    var count = 0;
    var itemsCount = 3;
    if (elem) {
        window.addEventListener('scroll', function() {
            if (count < itemsCount && isInViewport(loader, 200) && !timer) {
                loader.style.opacity = 1;
                count++;
                timer = setTimeout(function() {
                    var source = document.getElementById("entry-template").innerHTML;
                    var template = Handlebars.compile(source);
                    var item = document.createElement('div');

                    for (var i = 0; i < itemsCount; i++) {
                        elem.appendChild(item);
                        item.outerHTML = template();
                    }

                    loader.style.opacity = 0;
                    clearTimeout(timer);
                    timer = undefined;

                    if (count === 3) {
                        loader.style.display = 'none';
                    }
                }, 500);
            }


        }, false);
    }
}

function Tabs() {
    var tabs = document.querySelectorAll('[data-tabs]');

    tabs.forEach(function(context) {
        var items = context.querySelectorAll('[data-tabs-item]');
        var contents = context.querySelectorAll('[data-tabs-content]');
        items.forEach(function(tab) {
            tab.addEventListener('click', function(e) {
                items.forEach(function(a) { a.classList.remove('active') });
                tab.classList.add('active');
                var id = e.currentTarget.getAttribute('data-tabs-item');
                var content = context.querySelector('[data-tabs-content="' + id + '"]');
                contents.forEach(function(a) { a.classList.remove('active') });
                if(content) {            
                   content.classList.add('active');
                }
            });
        });
    });
}

function Toggle() {
    var toggleBtn = document.querySelector('[data-toggle]');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', function(e) {
            var id = e.currentTarget.getAttribute('data-toggle');
            var elem = document.querySelector('[data-toggle-block="' + id + '"]');
            $(elem).slideToggle();
            $(toggleBtn).toggleClass('active');
        });
    }
}


// function ToggleTabs() {
//     // var toggleBtn = document.querySelector('[data-toggle]');
//     var tabs = document.querySelectorAll('[data-toggle-block]');

//     // if (tabs) {
//         tabs.forEach(function(tab){
//             tab.addEventListener('click', function(e) {
//                 tabs.forEach(function(a){ $(a).removeClass('active')})
//                 // var id = e.currentTarget.getAttribute('data-toggle-block');
//                 // var elem = document.querySelector('[data-toggle-block="' + id + '"]');
//                 // $(elem).slideToggle();
//                 $(this).addClass('active');
//             });
//         });
//     // }
// }

function SlickArrows() {
    var arrows = document.querySelector('[data-slick-arrows]');
    if (arrows) {
        var left = arrows.querySelector('[data-click-arrows-left]');
        var right = arrows.querySelector('[data-click-arrows-right]');
        var id = arrows.getAttribute('data-slick-arrows');
        var instance = document.querySelector('[data-slick-arrows-instance="'+id+'"]');
        
        left.addEventListener('click', function(e) {
            $(instance).slick('slickPrev');
        });
        right.addEventListener('click', function(e) {
            $(instance).slick('slickNext');
        });
    }

}


if (window.jQuery) {

    if ($('.phone-input').length) {
        $('.phone-input').mask("+7  (  000  )  000  00  00", { placeholder: "+7  (  ___  )   ___   __   __" });
    }

    if ($('.slick-slider').length) {
        $('.slick-slider').slick({
            slidesToShow: 3,
            slidesToScroll: 3,
            responsive: [{
                    breakpoint: 1400,
                    settings: {
                        slidesToShow: 2,
                        slidesToScroll: 2
                    }
                },
                {
                    breakpoint: 980,
                    settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1
                    }
                }
            ]
        });
    }

    var shopFilterDrop = document.querySelector('.shop-filter__dropdown');
    var shopFilterMenu = document.querySelector('.shop-filter__menu');
    $(shopFilterMenu).on('click', function(e) {
        e.stopPropagation();
        $(shopFilterMenu).parent().toggleClass('active');
    });

    window.addEventListener('click', function(e) {
        if (shopFilterDrop && !shopFilterDrop.contains(e.target)) {
            $(shopFilterMenu).parent().removeClass('active');
        }
    }, false);
}