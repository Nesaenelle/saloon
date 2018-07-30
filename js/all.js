var SharedObj = {
    forms: new Form(document.querySelector('form')),
    modals: new ModalController(),
    navigation: new NavigationController(),
    menu: new MenuController(),
    HomePageSlider: new HomePageSlider()
};


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
                // SharedObj.modals.openModal('video');
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
    if (this.input.getAttribute('data-pass-confirm')) {
        if (this.input.value === this.parent.form.querySelector('[data-pattern="password"]').value) {
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
    this.msg.className = 'input-msg invalid';
    this.msg.innerHTML = 'Enter the correct email';
    this.input.parentNode.appendChild(this.msg);
    this.valid = false;
};

Input.prototype.removeError = function() {
    this.input.classList.add('valid');
    this.input.classList.remove('invalid');
    this.msg.className = 'input-msg valid';
    this.msg.innerHTML = 'This is correct email';
    this.input.parentNode.appendChild(this.msg);
    this.valid = true;
};

Input.prototype.clear = function() {
    this.input.classList.remove('valid');
    this.input.classList.remove('invalid');
    this.input.parentNode.removeChild(this.msg);
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

function isInViewport(el) {
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
        top < (window.pageYOffset + window.innerHeight) &&
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

    if(this.slider) {    
        this.sliderInner = this.slider.querySelector('[data-home-page-slider-inner]');
        window.addEventListener('resize', function() {
            self.update();
        });

        if (this.slider) {
            this.slides = this.slider.querySelectorAll('[data-home-page-slider-item]');
            this.nextBtn = this.slider.querySelector('[data-home-page-slider-next]');
            this.activeIndex = 0;

            this.nextBtn.addEventListener('click', function(e) {
                self.next();
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
    if(this.sliderInner) {    
        this.sliderInner.style.width = this.slides.length * window.innerWidth + 'px';

        this.slides.forEach(function(slide, i) {
            slide.style.width = window.innerWidth + 'px';
        });

        this.position();
    }
};

HomePageSlider.prototype.position = function() {
    var offset = -(this.activeIndex * window.innerWidth) + 'px';
    this.sliderInner.style.transform = 'translateX(' + offset + ')';
};


SharedObj.HomePageSlider.update();