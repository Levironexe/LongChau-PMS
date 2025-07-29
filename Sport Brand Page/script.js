$(document).ready(function() {
    let currentSlide = 0;
    const slides = $('.slide');
    const dots = $('.dot');
    const totalSlides = slides.length;
    const intervalTime = 6000;
    const transitionTime = 1500;
    let slideInterval;
    let progressBar = $('.progress-bar');
    let animationInProgress = false;
    let progressBarAnimation;

    // Initialize slides with proper visibility
    function initSlides() {
        slides.each(function(index) {
            if (index === 0) {
                $(this).css({
                    'z-index': 2,
                    'clip-path': 'polygon(0 0, 100% 0, 100% 100%, 0 100%)'
                });
            } else {
                $(this).css({
                    'z-index': 0,
                    'clip-path': 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)'
                });
            }
        });
        
        dots.removeClass('active');
        $(dots[0]).addClass('active');
    }

    initSlides();

    //R eset and start the progress bar animation
    function resetAndStartProgressBar() {
        // Cancel any existing animation
        if (progressBarAnimation) {
            progressBar.stop(true);
            clearTimeout(progressBarAnimation);
        }
        
        // Reset to 0%
        progressBar.css('width', '0%');
        
        // Start fresh animation that runs exactly for intervalTime
        progressBarAnimation = setTimeout(function() {
            progressBar.animate({ width: '100%' }, intervalTime, 'linear');
        }, 50); // Small delay to ensure CSS has updated
    }

    //Start slideshow with proper synchronization
    function startSlideshow() {
        // Clear existing interval
        clearInterval(slideInterval);

        // Reset progress bar
        resetAndStartProgressBar();
        
        // Set new interval
        slideInterval = setInterval(function() {
            if (!animationInProgress) {
                nextSlide();
            }
        }, intervalTime);
    }

    // Show a specific slide
    function showSlide(index) {
        // Prevent showing the same slide or when animation is in progress
        if (currentSlide === index || animationInProgress) return;
        
        // Prevent multiple transitions
        animationInProgress = true;
        
        // Reset progress bar when transition
        resetAndStartProgressBar();

        // Get current and next slide elements
        const currentActive = $(slides[currentSlide]);
        const nextSlide = $(slides[index]);

        // Reset all slides to default state first (except current and next)
        slides.not(currentActive).not(nextSlide).removeClass('active previous').css({
            'z-index': 0,
            'clip-path': 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)'
        });

        // Prepare the next slide for transition
        nextSlide.css({
            'z-index': 2,
            'clip-path': 'polygon(0 0, 100% 0, 100% 100%, 0 100%)'
        });

        // Add active class to next slide
        nextSlide.addClass('active');

        // Remove active class from current slide and add previous class
        currentActive.removeClass('active').addClass('previous');
        
        // Move current slide to left with consistent animation
        currentActive.css({
            'z-index': 1,
            'clip-path': 'polygon(0 0, 0 0, 0 100%, 0 100%)'
        });

        // Update dots
        dots.removeClass('active');
        $(dots[index]).addClass('active');

        // Clean up after transition completes
        setTimeout(function() {
            // Reset state for non-active slides
            slides.not(nextSlide).removeClass('previous').css({
                'z-index': 1,
                'clip-path': 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)'
            });

            // Update current slide index
            currentSlide = index;
            
            // Release animation lock
            animationInProgress = false;
        }, transitionTime);
    }

    // Go to the next slide
    function nextSlide() {
        let nextIndex = (currentSlide + 1) % totalSlides;
        showSlide(nextIndex);
    }

    // Go to the previous slide
    function prevSlide() {
        let prevIndex = (currentSlide - 1 + totalSlides) % totalSlides;
        showSlide(prevIndex);
    }

    // Next button (manual navigation)
    $('.next').click(function() {
        // Stop current interval
        clearInterval(slideInterval);
        
        // Show next slide
        nextSlide();
        
        // Restart interval timing from this point
        slideInterval = setInterval(function() {
            if (!animationInProgress) {
                nextSlide();
            }
        }, intervalTime);
    });

    // Previous button (manual navigation)
    $('.prev').click(function() {
        // Stop current interval
        clearInterval(slideInterval);
        
        // Show previous slide
        prevSlide();
        
        // Restart interval timing from this point
        slideInterval = setInterval(function() {
            if (!animationInProgress) {
                nextSlide();
            }
        }, intervalTime);
    });

    // Dot indicators (manual navigation)
    $('.dot').click(function() {
        // Stop current interval
        clearInterval(slideInterval);
        
        // Show selected slide
        let dotIndex = $(this).data('index');
        showSlide(dotIndex);
        
        // Restart interval timing from this point
        slideInterval = setInterval(function() {
            if (!animationInProgress) {
                nextSlide();
            }
        }, intervalTime);
    });

    // Pause slideshow on hover
    $('.hero-slider').hover(
        function() {
            // On hover - stop interval and pause progress bar
            clearInterval(slideInterval);
            progressBar.stop(true); // Stop animation but keep current width
        },
        function() {
            // On hover out - calculate remaining time based on progress bar width
            if (!animationInProgress) {
                // Get current progress (0-1)
                const currentProgress = progressBar.width() / progressBar.parent().width();
                
                // Calculate remaining time
                const remainingTime = intervalTime * (1 - currentProgress);
                
                // Start a one-time timeout for the remainder
                clearInterval(slideInterval);
                
                // Continue progress bar animation from current position
                progressBar.animate({ width: '100%' }, remainingTime, 'linear');
                
                // Set timeout for next slide based on remaining time
                setTimeout(function() {
                    nextSlide();
                    startSlideshow();
                }, remainingTime);
            }
        }
    );

    // Ensure the slideshow starts properly after page load
    $(window).on('load', function() {
        // Slight delay to ensure everything is fully initialized
        setTimeout(function() {
            startSlideshow();
        }, 100);
    });

    // Fallback in case the load event already fired
    setTimeout(function() {
        if (!slideInterval) {
            startSlideshow();
        }
    }, 500);

    function initProductsSlider() {
        const sliderContainer = $('#productsSlider');
        const slides = $('.product-slide');
        const totalSlides = slides.length;
        let currentPosition = 0;
        const progressIndicator = $('#productsProgress');
        const dotsContainer = $('#productsDots');
        
        // Function to get responsive slides to show
        function getSlidesToShow() {
            if (window.innerWidth <= 576) return 1;
            if (window.innerWidth <= 992) return 2;
            return 3;
        }
        
        // Create dots based on current view
        function createDots() {
            dotsContainer.empty();
            
            const slidesToShow = getSlidesToShow();
            const pages = Math.ceil(totalSlides / slidesToShow);
            
            for (let i = 0; i < pages; i++) {
                const dot = $('<div>').addClass('products-dot');
                dot.data('position', i * slidesToShow);
                if (i === 0) dot.addClass('active');
                dotsContainer.append(dot);
            }
        }
        
        // Update slider position with infinite navigation
        function goToPosition(position) {
            const slidesToShow = getSlidesToShow();
            
            // Implement infinite navigation
            if (position < 0) {
                position = totalSlides - slidesToShow;
            } else if (position >= totalSlides) {
                position = 0;
            }
            
            // Update current position
            currentPosition = position;
            
            // Calculate the percentage to slide
            const slideWidth = 100 / slidesToShow;
            const translateValue = -position * slideWidth;
            
            // Apply transform
            sliderContainer.css('transform', `translateX(${translateValue}%)`);
            
            // Update dots - find which "page" we're on
            $('.products-dot').removeClass('active');
            const activeDotIndex = Math.floor(position / slidesToShow);
            const normalizedDotIndex = activeDotIndex % Math.ceil(totalSlides / slidesToShow);
            $(`.products-dot:eq(${normalizedDotIndex})`).addClass('active');
            
            // Always enable both navigation arrows for infinite navigation
            $('#prevProducts, #nextProducts').removeClass('disabled');
            
            // Update progress indicator
            updateProgressIndicator();
        }
        
        // Update progress indicator for circular navigation
        function updateProgressIndicator() {
            const slidesToShow = getSlidesToShow();
            const totalPositions = totalSlides;
            
            // Calculate normalized position (0 to totalPositions-1)
            const normalizedPosition = currentPosition % totalPositions;
            
            // For progress bar
            const progressWidth = 100 / Math.ceil(totalSlides / slidesToShow);
            const progressOffset = (normalizedPosition / slidesToShow) * progressWidth;
            
            progressIndicator.css({
                'width': `${progressWidth}%`,
                'left': `${progressOffset}%`
            });
        }
        
        // Next button click handler - with circular navigation
        $('#nextProducts').on('click', function() {
            // Just go to next position, goToPosition will handle wrapping
            goToPosition(currentPosition + 1);
        });
        
        // Previous button click handler - with circular navigation
        $('#prevProducts').on('click', function() {
            // Just go to previous position, goToPosition will handle wrapping
            goToPosition(currentPosition - 1);
        });
        
        // Dot navigation
        $(document).on('click', '.products-dot', function() {
            const position = $(this).data('position');
            goToPosition(position);
        });
        
        // Handle window resize
        $(window).on('resize', function() {
            const previousSlidesPerPage = getSlidesToShow();
            const previousScrollPercentage = (currentPosition % totalSlides) / totalSlides;
            
            // Recreate dots based on new viewport size
            createDots();
            
            // Calculate new position to maintain approximate scroll position in the circular context
            const newPosition = Math.round(previousScrollPercentage * totalSlides);
            goToPosition(newPosition);
        });
        
        // Initialize
        createDots();
        goToPosition(0);
    }

    // Initialize products slider when document is ready
    $(document).ready(function() {
        initProductsSlider();
        initInteractiveProductShowcase(); // Initialize the interactive product showcase
    });
    
    // Interactive Product Showcase functionality using GSAP
    function initInteractiveProductShowcase() {
        // Variables
        let currentProduct = "product1";
        let isAnimating = false;
        let rotateTimelines = {};
        let dragStartX, dragStartY;
        let isDragging = false;
        let rotationY = 0;
        let rotationX = 0;
        let explodedElements = {};
        let highlightEffects = {};
        let notificationInterval;

        // Initialize GSAP by registering necessary plugins
        console.log("Initializing Interactive Product Showcase with GSAP");

        // Helper function to scroll to showcase section
        function scrollToShowcase() {
            const showcaseSection = document.querySelector('.interactive-showcase');
            if (showcaseSection) {
                showcaseSection.scrollIntoView({ behavior: 'smooth' });
            }
        }

        // Set initial product position and apply 3D effects
        function setupProducts() {
            // Set initial positions and styles
            gsap.set("#product1", { x: 0, y: 0, z: 0, scale: 1, opacity: 1 });
            gsap.set("#product2", { x: -330, y: 0, z: -100, scale: 0.85, opacity: 0.7 });
            gsap.set("#product3", { x: 330, y: 0, z: -100, scale: 0.85, opacity: 0.7 });

            // Create subtle floating animation for active product
            gsap.to(`#${currentProduct}`, {
                y: -10,
                duration: 2,
                repeat: -1,
                yoyo: true,
                ease: "power1.inOut"
            });
        }

        // Switch between products with animation
        function switchProduct(productId) {
            // If same product or animation in progress, exit
            if (currentProduct === productId || isAnimating) return;
            
            // Set animating flag
            isAnimating = true;
            
            // Stop any existing animations
            gsap.killTweensOf(`#${currentProduct}`);
            
            // Update active dot
            $('.selector-dot').removeClass('active');
            $(`.selector-dot[data-product="${productId}"]`).addClass('active');
            
            // Show corresponding product panel
            $('.feature-panel').removeClass('active');
            $(`.feature-panel[data-product="${productId}"]`).addClass('active');

            // Get current positions
            let positions = {
                current: { x: 0, y: 0, z: 0, scale: 1, opacity: 1 },
                left: { x: -330, y: 0, z: -100, scale: 0.85, opacity: 0.7 },
                right: { x: 330, y: 0, z: -100, scale: 0.85, opacity: 0.7 }
            };

            // Determine product positions before animation
            let currentPos = $(`#${currentProduct}`).css('transform');
            let targetPos = $(`#${productId}`).css('transform');
            let direction = "";
            
            // Determine animation direction
            if ($(`#${productId}`).position().left < $(`#${currentProduct}`).position().left) {
                direction = "right"; // New product is on left, moves to center
            } else {
                direction = "left"; // New product is on right, moves to center
            }
            
            // Position timeline for smooth transitions between products
            const tl = gsap.timeline({
                onComplete: function() {
                    isAnimating = false;
                    currentProduct = productId;
                    
                    // Add floating animation to new active product
                    gsap.to(`#${currentProduct}`, {
                        y: -10,
                        duration: 2,
                        repeat: -1,
                        yoyo: true,
                        ease: "power1.inOut"
                    });

                    // Update drag instruction text based on current product
                    updateInstructionText();
                }
            });

            // Create complex animation sequence with overlapping animations for smooth transitions
            if (direction === "right") {
                // Current product moves right
                tl.to(`#${currentProduct}`, {
                    x: positions.right.x,
                    z: positions.right.z,
                    scale: positions.right.scale,
                    opacity: positions.right.opacity,
                    duration: 0.8,
                    ease: "power2.inOut"
                }, 0);
                
                // Product on left moves to center
                tl.to(`#${productId}`, {
                    x: positions.current.x,
                    z: positions.current.z,
                    scale: positions.current.scale,
                    opacity: positions.current.opacity,
                    duration: 0.8,
                    ease: "power2.inOut"
                }, 0);

                // Third product might need to move to maintain circulation
                $(".product-card-3d").each(function() {
                    const pId = $(this).attr('id');
                    if (pId !== currentProduct && pId !== productId) {
                        tl.to(`#${pId}`, {
                            x: positions.left.x,
                            z: positions.left.z,
                            scale: positions.left.scale,
                            opacity: positions.left.opacity,
                            duration: 0.8,
                            ease: "power2.inOut"
                        }, 0);
                    }
                });
            } else {
                // Current product moves left
                tl.to(`#${currentProduct}`, {
                    x: positions.left.x,
                    z: positions.left.z,
                    scale: positions.left.scale,
                    opacity: positions.left.opacity,
                    duration: 0.8,
                    ease: "power2.inOut"
                }, 0);
                
                // Product on right moves to center
                tl.to(`#${productId}`, {
                    x: positions.current.x,
                    z: positions.current.z,
                    scale: positions.current.scale,
                    opacity: positions.current.opacity,
                    duration: 0.8,
                    ease: "power2.inOut"
                }, 0);

                // Third product might need to move to maintain circulation
                $(".product-card-3d").each(function() {
                    const pId = $(this).attr('id');
                    if (pId !== currentProduct && pId !== productId) {
                        tl.to(`#${pId}`, {
                            x: positions.right.x,
                            z: positions.right.z,
                            scale: positions.right.scale,
                            opacity: positions.right.opacity,
                            duration: 0.8,
                            ease: "power2.inOut"
                        }, 0);
                    }
                });
            }
            
            // Reset any ongoing card animations
            resetCardAnimations();
        }
        
        // Update the instruction text based on the current product
        function updateInstructionText() {
            let instructionText = "";
            
            switch(currentProduct) {
                case "product1":
                    instructionText = "Drag to rotate product";
                    break;
                case "product2":
                    instructionText = "Click to view exploded view";
                    break;
                case "product3":
                    instructionText = "Hover to explore product";
                    break;
                default:
                    instructionText = "Interact with the product";
            }
            
            $('.drag-instruction span').text(instructionText);
        }
        
        // Reset any ongoing animations when switching products
        function resetCardAnimations() {
            // Reset explode view if active
            Object.keys(explodedElements).forEach(productId => {
                if (explodedElements[productId]) {
                    explodedElements[productId].progress(1).reverse();
                    explodedElements[productId] = null;
                }
            });
            
            // Reset any highlight effects
            Object.keys(highlightEffects).forEach(productId => {
                if (highlightEffects[productId]) {
                    highlightEffects[productId].kill();
                    highlightEffects[productId] = null;
                }
            });
            
            // Clear notifications interval
            if (notificationInterval) {
                clearInterval(notificationInterval);
                notificationInterval = null;
            }
            
            // Reset rotations
            $(".product-card-inner").each(function() {
                gsap.to(this, {
                    rotationY: 0,
                    rotationX: 0,
                    duration: 0.5,
                    ease: "power2.out"
                });
            });
            
            // Important: First remove all event handlers to avoid duplicates
            $(".product-card-3d").off('click mouseenter mouseleave mousedown touchstart');
            
            // Then re-establish the correct interaction behaviors for each product
            setupCardInteractions();
        }

        // Setup product-specific interactions
        function setupCardInteractions() {
            // Product 1 - Elite Runner - Drag to rotate only
            setupDragRotation("#product1");
            $("#product1").css('cursor', 'grab');
            
            // Product 2 - Vital Tracker - Click to explode view only
            $("#product2").css('cursor', 'pointer');
            $("#product2").on('click', function() {
                if ($(this).attr('id') === currentProduct) {
                    animateExplode(currentProduct);
                }
            });
            
            // Product 3 - Cloud Walker - Hover effect only
            $("#product3").css('cursor', 'default');
            
            // Fix: Complete rewrite of the hover functionality for product3
            $("#product3").on('mouseenter', function() {
                // Only apply effect when this is the current product
                if ($(this).attr('id') === currentProduct) {
                    gsap.to(`#${this.id} .product-card-inner`, {
                        rotationY: 180, // Fix: Change from 15 to 180 degrees for full flip
                        duration: 0.5,
                        ease: "power2.out"
                    });
                    
                    // Add shimmer overlay if it doesn't exist
                    if ($(this).find('.shimmer-overlay').length === 0) {
                        $(this).append('<div class="shimmer-overlay"></div>');
                        
                        gsap.set(`#${this.id} .shimmer-overlay`, {
                            position: 'absolute',
                            top: 0,
                            left: '-100%',
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%)',
                            opacity: 0.5,
                            zIndex: 5,
                            pointerEvents: 'none'
                        });
                    }
                    
                    // Animate shimmer effect
                    gsap.to(`#${this.id} .shimmer-overlay`, {
                        left: '100%',
                        duration: 1.2,
                        ease: "power2.inOut",
                        repeat: 2
                    });
                }
            });
            
            $("#product3").on('mouseleave', function() {
                if ($(this).attr('id') === currentProduct) {
                    gsap.to(`#${this.id} .product-card-inner`, {
                        rotationY: 0,
                        duration: 0.5,
                        ease: "power2.out"
                    });
                }
            });
        }

        // Handle 3D rotation on drag - specifically for product 1
        function setupDragRotation(productSelector) {
            // Only setup drag for product1 (Elite Runner)
            if (productSelector !== "#product1") return;
            
            const card = $(productSelector);
            const productId = card.attr('id');
            
            // Set initial grab cursor to indicate interactivity
            card.css('cursor', 'grab');
            
            // Mouse/Touch down event
            card.on('mousedown touchstart', function(e) {
                if (productId !== currentProduct) return;
                
                e.preventDefault();
                // Store which card is being dragged
                card.data('dragging', true);
                isDragging = true;
                
                // Get starting position
                if (e.type === 'mousedown') {
                    dragStartX = e.pageX;
                    dragStartY = e.pageY;
                } else {
                    dragStartX = e.originalEvent.touches[0].pageX;
                    dragStartY = e.originalEvent.touches[0].pageY;
                }
                
                // Set cursor style
                card.css('cursor', 'grabbing');
                
                // Highlight instruction temporarily
                gsap.to('.drag-instruction', {
                    scale: 1.1,
                    color: "#0000ff",
                    duration: 0.3,
                    yoyo: true,
                    repeat: 1
                });
            });
            
            // Mouse/Touch move event - handle rotation
            $(document).on('mousemove touchmove', function(e) {
                // Only process movement for product1 and only when it's being dragged
                const card = $("#product1");
                const productId = "product1";
                
                if (!card.data('dragging') || productId !== currentProduct) return;
                
                let currentX, currentY;
                
                if (e.type === 'mousemove') {
                    currentX = e.pageX;
                    currentY = e.pageY;
                } else {
                    currentX = e.originalEvent.touches[0].pageX;
                    currentY = e.originalEvent.touches[0].pageY;
                }
                
                // Calculate rotation based on movement
                const deltaX = currentX - dragStartX;
                const deltaY = currentY - dragStartY;
                
                // Apply rotation with GSAP for smooth motion
                rotationY = deltaX * 0.5;
                rotationX = -deltaY * 0.5;
                
                // Limit rotation angles
                rotationY = Math.min(Math.max(rotationY, -30), 30);
                rotationX = Math.min(Math.max(rotationX, -15), 15);
                
                gsap.to(`#${productId} .product-card-inner`, {
                    rotationY: rotationY,
                    rotationX: rotationX,
                    duration: 0.1,
                    ease: "power1.out"
                });
            });
            
            // Mouse/Touch up event - end rotation
            $(document).on('mouseup touchend', function() {
                // Only process for product1
                const card = $("#product1");
                const productId = "product1";
                
                // Only process if product1 was being dragged
                if (card.data('dragging')) {
                    // Reset drag state
                    card.data('dragging', false);
                    isDragging = false;
                    
                    // Reset cursor
                    card.css('cursor', 'grab');
                    
                    // Return to neutral position with animation
                    if (productId === currentProduct) {
                        gsap.to(`#${productId} .product-card-inner`, {
                            rotationY: 0,
                            rotationX: 0,
                            duration: 0.8,
                            ease: "elastic.out(1, 0.5)"
                        });
                    }
                }
            });
        }
        
        // Initialize product feature animation buttons
        function initFeatureAnimations() {
            // Handle feature animation button clicks
            $('.animate-feature-btn').on('click', function() {
                const feature = $(this).data('feature');
                const currentProd = currentProduct;
                
                // Reset any running animations first
                if (rotateTimelines[currentProd]) {
                    rotateTimelines[currentProd].kill();
                }
                
                // Execute animation based on feature type
                switch(feature) {
                    case 'rotate':
                        animateRotate(currentProd);
                        break;
                    case 'explode':
                        animateExplode(currentProd);
                        break;
                    case 'pulse':
                        animatePulse(currentProd);
                        break;
                    case 'notifications':
                        animateNotifications(currentProd);
                        break;
                    case 'compress':
                        animateCompress(currentProd);
                        break;
                    case 'highlight':
                        animateHighlight(currentProd);
                        break;
                }
            });
        }
        
        // Animation: 360-degree rotation
        function animateRotate(productId) {
            // Kill any existing rotation timeline
            if (rotateTimelines[productId]) {
                rotateTimelines[productId].kill();
            }
            
            // Create a smooth 360° rotation
            rotateTimelines[productId] = gsap.timeline({
                repeat: 1,
                onComplete: function() {
                    // Reset to initial state
                    gsap.to(`#${productId} .product-card-inner`, {
                        rotationY: 0,
                        duration: 0.8,
                        ease: "power2.inOut"
                    });
                }
            });
            
            rotateTimelines[productId].to(`#${productId} .product-card-inner`, {
                rotationY: "+=360",
                duration: 2,
                ease: "power1.inOut"
            });
            
            return rotateTimelines[productId];
        }
        
        // Animation: Explode view
        function animateExplode(productId) {
            // If already exploded, reverse the effect
            if (explodedElements[productId]) {
                explodedElements[productId].reverse();
                explodedElements[productId] = null;
                return;
            }
            
            // Create an explode animation showing product components
            explodedElements[productId] = gsap.timeline();
            
            // Create parts for exploded view
            const productCard = $(`#${productId}`);
            
            // Add parts dynamically for explode effect
            if (productCard.find('.explode-parts').length === 0) {
                const parts = `
                    <div class="explode-parts">
                        <div class="part part1"></div>
                        <div class="part part2"></div>
                        <div class="part part3"></div>
                        <div class="part part4"></div>
                    </div>
                `;
                productCard.append(parts);
                
                // Style parts to match the product
                const bgImg = productCard.find('.product-card-front img').attr('src');
                
                productCard.find('.part').each(function(index) {
                    gsap.set(this, {
                        width: '50%',
                        height: '50%',
                        position: 'absolute',
                        backgroundImage: `url(${bgImg})`,
                        backgroundSize: '200% 200%',
                        opacity: 0,
                        zIndex: 10
                    });
                });
                
                // Position parts to create proper background sections
                gsap.set(productCard.find('.part1'), { top: 0, left: 0, backgroundPosition: '0 0' });
                gsap.set(productCard.find('.part2'), { top: 0, right: 0, backgroundPosition: '100% 0' });
                gsap.set(productCard.find('.part3'), { bottom: 0, left: 0, backgroundPosition: '0 100%' });
                gsap.set(productCard.find('.part4'), { bottom: 0, right: 0, backgroundPosition: '100% 100%' });
            }
            
            // Animate the parts outward
            explodedElements[productId]
                .to(productCard.find('.product-card-front img'), { opacity: 0, duration: 0.5 })
                .to(productCard.find('.part'), { opacity: 1, duration: 0.5 }, "-=0.3")
                .to(productCard.find('.part1'), { x: -30, y: -30, rotation: -5, duration: 0.8 }, "-=0.3")
                .to(productCard.find('.part2'), { x: 30, y: -30, rotation: 5, duration: 0.8 }, "-=0.8")
                .to(productCard.find('.part3'), { x: -30, y: 30, rotation: 5, duration: 0.8 }, "-=0.8")
                .to(productCard.find('.part4'), { x: 30, y: 30, rotation: -5, duration: 0.8 }, "-=0.8");
            
            return explodedElements[productId];
        }
        
        // Animation: Pulse (heartbeat effect)
        function animatePulse(productId) {
            const tl = gsap.timeline({repeat: 5, yoyo: true});
            
            // Create a pulsing heartbeat animation
            tl.to(`#${productId}`, {
                scale: "+=0.05",
                duration: 0.2,
                ease: "power1.inOut"
            }).to(`#${productId}`, {
                scale: "-=0.05",
                duration: 0.4,
                ease: "power1.inOut"
            }).to(`#${productId}`, {
                scale: "+=0.08",
                duration: 0.2,
                ease: "power1.inOut"
            }).to(`#${productId}`, {
                scale: "-=0.08",
                duration: 0.5,
                ease: "power1.inOut"
            }).to(`#${productId}`, {
                scale: 1,
                duration: 0.3
            });
            
            return tl;
        }
        
        // Animation: Notifications
        function animateNotifications(productId) {
            // Clear existing notification animation
            if (notificationInterval) {
                clearInterval(notificationInterval);
            }
            
            // Create notification elements if they don't exist
            if ($(`#${productId} .notification-bubble`).length === 0) {
                $(`#${productId}`).append(`
                    <div class="notification-bubble notification1">
                        <i class="fas fa-heart"></i>
                    </div>
                    <div class="notification-bubble notification2">
                        <i class="fas fa-bell"></i>
                    </div>
                    <div class="notification-bubble notification3">
                        <i class="fas fa-comment"></i>
                    </div>
                `);
                
                // Style notification bubbles
                gsap.set(`#${productId} .notification-bubble`, {
                    position: 'absolute',
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    backgroundColor: '#0000ff',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    opacity: 0,
                    zIndex: 10
                });
                
                // Position bubbles at different points around the watch
                gsap.set(`#${productId} .notification1`, { top: '20%', right: '10%' });
                gsap.set(`#${productId} .notification2`, { top: '40%', right: '5%' });
                gsap.set(`#${productId} .notification3`, { top: '60%', right: '10%' });
            }
            
            // Animated notification function
            function showNotification(selector) {
                gsap.fromTo(selector, 
                    { scale: 0, opacity: 0 },
                    { 
                        scale: 1, 
                        opacity: 1, 
                        duration: 0.5, 
                        ease: "elastic.out(1, 0.5)",
                        onComplete: function() {
                            gsap.to(selector, {
                                scale: 0,
                                opacity: 0,
                                delay: 1.5,
                                duration: 0.3,
                                ease: "power2.in"
                            });
                        }
                    }
                );
            }
            
            // Show notifications in sequence
            let counter = 0;
            showNotification(`#${productId} .notification1`);
            
            notificationInterval = setInterval(() => {
                counter++;
                showNotification(`#${productId} .notification${(counter % 3) + 1}`);
                
                // Stop after a few notifications
                if (counter >= 8) {
                    clearInterval(notificationInterval);
                    notificationInterval = null;
                }
            }, 2000);
        }
        
        // Animation: Compress (demonstrate cushioning)
        function animateCompress(productId) {
            const tl = gsap.timeline();
            
            // Create a compression animation to show cushioning
            tl.to(`#${productId}`, {
                scaleY: 0.85,
                y: 20,
                duration: 0.5,
                ease: "power2.in"
            }).to(`#${productId}`, {
                scaleY: 1,
                y: 0,
                duration: 0.8,
                ease: "elastic.out(1, 0.3)"
            });
            
            return tl;
        }
        
        // Animation: Highlight product features
        function animateHighlight(productId) {
            // If already highlighted, reverse the effect
            if (highlightEffects[productId]) {
                highlightEffects[productId].reverse();
                highlightEffects[productId] = null;
                return;
            }
            
            const productCard = $(`#${productId}`);
            
            // Create spotlight highlights to move across the product
            if (productCard.find('.highlight-spot').length === 0) {
                productCard.append(`
                    <div class="highlight-spot spot1"></div>
                    <div class="highlight-spot spot2"></div>
                    <div class="highlight-spot spot3"></div>
                `);
            }
            
            // Create timeline for highlights
            highlightEffects[productId] = gsap.timeline({
                repeat: -1,
                repeatDelay: 0.5
            });
            
            // Animate the first spotlight along a path
            highlightEffects[productId].fromTo(`#${productId} .spot1`, 
                { left: "10%", top: "20%", opacity: 0, scale: 0.5 },
                { opacity: 1, scale: 1, duration: 0.5 }
            ).to(`#${productId} .spot1`, {
                left: "40%", top: "30%", 
                duration: 1.5,
                ease: "power1.inOut"
            }).to(`#${productId} .spot1`, {
                opacity: 0, scale: 0.5,
                duration: 0.5
            });
            
            // Second spotlight - different path
            highlightEffects[productId].fromTo(`#${productId} .spot2`, 
                { left: "70%", top: "60%", opacity: 0, scale: 0.5 },
                { opacity: 1, scale: 1, duration: 0.5 },
                "-=0.5"
            ).to(`#${productId} .spot2`, {
                left: "30%", top: "70%", 
                duration: 1.5,
                ease: "power1.inOut"
            }).to(`#${productId} .spot2`, {
                opacity: 0, scale: 0.5,
                duration: 0.5
            });
            
            // Third spotlight
            highlightEffects[productId].fromTo(`#${productId} .spot3`, 
                { left: "50%", top: "50%", opacity: 0, scale: 0.5 },
                { opacity: 1, scale: 1, duration: 0.5 },
                "-=0.5" 
            ).to(`#${productId} .spot3`, {
                left: "70%", top: "20%", 
                duration: 1.5,
                ease: "power1.inOut"
            }).to(`#${productId} .spot3`, {
                opacity: 0, scale: 0.5,
                duration: 0.5
            });
            
            return highlightEffects[productId];
        }

        // Handle navigation with arrows
        function setupNavigation() {
            // Previous showcase arrow
            $('#prevShowcase').on('click', function() {
                let prevId;
                
                if (currentProduct === "product1") {
                    prevId = "product2";
                } else if (currentProduct === "product2") {
                    prevId = "product3";
                } else {
                    prevId = "product1";
                }
                
                switchProduct(prevId);
            });
            
            // Next showcase arrow
            $('#nextShowcase').on('click', function() {
                let nextId;
                
                if (currentProduct === "product1") {
                    nextId = "product3";
                } else if (currentProduct === "product2") {
                    nextId = "product1";
                } else {
                    nextId = "product2";
                }
                
                switchProduct(nextId);
            });
        }

        // Handle product selection via selector dots
        function setupSelectors() {
            $('.selector-dot').on('click', function() {
                const productId = $(this).data('product');
                switchProduct(productId);
            });
        }

        // Initialize the showcase
        setupProducts();
        setupCardInteractions();
        initFeatureAnimations();
        setupNavigation();
        setupSelectors();
        updateInstructionText();
    }

    // Initialize shopping cart variables
    window.shoppingList = [];
    window.totalCost = 0;
    window.products = [
        { name: "Running Shoes", price: 89.99, category: "Footwear", imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=500" },
        { name: "Fitness Tracker", price: 49.99, category: "Accessories", imageUrl: "https://images.unsplash.com/photo-1576243345690-4e4b79b63288?auto=format&fit=crop&q=80&w=500" },
        { name: "Sports Bottle", price: 15.99, category: "Equipment", imageUrl: "https://images.unsplash.com/photo-1546842931-886c185b4c8c?auto=format&fit=crop&q=80&w=500" },
        { name: "Training Shorts", price: 29.99, category: "Apparel", imageUrl: "https://images.unsplash.com/photo-1576082532855-902a24ea881c?auto=format&fit=crop&q=80&w=500" },
        { name: "Yoga Mat", price: 35.99, category: "Equipment", imageUrl: "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?auto=format&fit=crop&q=80&w=500" }
    ];

    // Initialization function
    function initialize() {
        console.log("Shopping Cart Prototype Initialized");
        checkListEmpty();
        countItems();
        updateStats();
        filterByCategory("all");
    }

    // Required functions
    window.addItem = function() {
        const productNameInput = document.getElementById('productNameInput');
        const productName = productNameInput.value.trim();
        
        if (!productName) {
            console.log("No item entered");
            return;
        }
        
        // Generate random price between 10 and 100
        const price = parseFloat((Math.random() * 90 + 10).toFixed(2));
        
        // Add to shopping list
        shoppingList.push({ 
            name: productName, 
            price: price, 
            category: "Custom", 
            imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=500" 
        });
        
        totalCost += price;
        console.log(`Item added: ${productName} - $${price}`);
        
        // Clear input
        productNameInput.value = '';
        
        // Show notification
        showToast(`${productName} added to cart`);
        
        renderCart();
        updateStats();
    };

    window.addProduct = function(name, price) {
        const product = products.find(p => p.name === name);
        if (product) {
            shoppingList.push({ 
                name: product.name, 
                price: product.price, 
                category: product.category, 
                imageUrl: product.imageUrl 
            });
            
            totalCost += product.price;
            console.log(`Item added: ${product.name} - $${product.price}`);
            
            // Show notification
            showToast(`${product.name} added to cart`);
            
            renderCart();
            updateStats();
        }
    };

    // Make existing addToCart function call the required addProduct function
    window.addToCart = function(name, price, category, imageUrl) {
        shoppingList.push({ name, price, category, imageUrl });
        totalCost += price;
        console.log(`Item added: ${name} - $${price}`);
        
        // Show toast notification
        showToast(`${name} added to cart`);
        
        renderCart();
        updateStats();
    };

    window.buyNow = function(name, price, category, imageUrl) {
        addToCart(name, price, category, imageUrl);
        scrollToCart();
    };

    window.removeItem = function(index) {
        const removedItem = shoppingList.splice(index, 1)[0];
        totalCost -= removedItem.price;
        console.log(`Item removed: ${removedItem.name} - $${removedItem.price}`);
        
        renderCart();
        updateStats();
    };

    window.checkout = function() {
        if (checkListEmpty()) {
            showCustomAlert("Your cart is empty!", "error");
            console.log("Checkout failed: Cart is empty");
        } else {
            console.log(`Checkout completed! Total amount: $${totalCost.toFixed(2)}`);
            
            // Create custom popup for success
            showCustomAlert("Thank you for your purchase!", "success", `
                <div class="checkout-details">
                    <div class="checkout-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <p class="checkout-message">Your order has been placed successfully</p>
                    <div class="checkout-summary">
                        <div class="checkout-row">
                            <span>Total Items:</span>
                            <span>${shoppingList.length}</span>
                        </div>
                        <div class="checkout-row">
                            <span>Total Amount:</span>
                            <span>$${totalCost.toFixed(2)}</span>
                        </div>
                    </div>
                    <button class="continue-shopping-btn">
                        <i class="fas fa-arrow-left"></i> Continue Shopping
                    </button>
                </div>
            `);
            
            // Clear the cart
            shoppingList = [];
            totalCost = 0;
            renderCart();
            updateStats();
        }
    };

    window.renderCart = function() {
        const listElement = document.getElementById('shoppingList');
        const emptyMessage = document.getElementById('emptyCartMessage');
        
        if (shoppingList.length === 0) {
            if (listElement) listElement.innerHTML = '';
            if (emptyMessage) emptyMessage.style.display = 'flex';
        } else {
            if (emptyMessage) emptyMessage.style.display = 'none';
            if (listElement) {
                listElement.innerHTML = '';
                
                shoppingList.forEach((item, index) => {
                    const li = document.createElement('li');
                    li.className = 'cart-item';
                    li.innerHTML = `
                        <div class="cart-item-info">
                            <img src="${item.imageUrl}" alt="${item.name}" class="cart-item-image">
                            <div class="cart-item-details">
                                <h4>${item.name}</h4>
                                <div class="cart-item-category">${item.category}</div>
                                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                            </div>
                        </div>
                        <div class="cart-item-actions">
                            <button class="remove-item-button" onclick="removeItem(${index})">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    `;
                    listElement.appendChild(li);
                });
            }
        }
        
        updateStats();
    };

    window.searchProducts = function() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return;
        
        const keyword = searchInput.value.trim().toLowerCase();
        const productElements = document.querySelectorAll('.product-card');
        const featuredItems = document.querySelectorAll('.featured-item');
        let foundResults = false;
        
        // Filter main product cards
        productElements.forEach(element => {
            const productName = element.querySelector('.product-title').textContent.toLowerCase();
            
            if (keyword === '' || productName.includes(keyword)) {
                element.classList.add('visible');
                element.classList.remove('hidden');
                foundResults = true;
            } else {
                element.classList.add('hidden');
                element.classList.remove('visible');
            }
        });
        
        // Filter featured products
        featuredItems.forEach(item => {
            // Get product name from the h4 element
            const productNameElement = item.querySelector('h4');
            if (!productNameElement) return;
            
            const productName = productNameElement.textContent.toLowerCase();
            
            if (keyword === '' || productName.includes(keyword)) {
                item.classList.add('visible');
                item.classList.remove('hidden');
                foundResults = true;
            } else {
                item.classList.add('hidden');
                item.classList.remove('visible');
            }
        });
        
        console.log(`Searching products with keyword: ${keyword}`);
        
        // If search term is not empty, scroll to the featured products section
        if (keyword !== '') {
            const featuredSection = document.querySelector('.featured-products');
            if (featuredSection) {
                featuredSection.scrollIntoView({ behavior: 'smooth' });
            }
            
            // Show a message if no results found
            if (!foundResults) {
                showToast(`No products found for "${keyword}"`);
            }
        }
        
        // Reset category filter to show all products that match the search
        if (keyword !== '') {
            const categoryFilter = document.getElementById('categoryFilter');
            if (categoryFilter) categoryFilter.value = 'all';
        }
    };

    window.filterByCategory = function(category) {
        const productElements = document.querySelectorAll('.product-card');
        const featuredItems = document.querySelectorAll('.featured-item');
        const searchInput = document.getElementById('searchInput');
        
        // Reset search bar when changing category
        if (searchInput) searchInput.value = '';
        
        // Filter main product cards
        productElements.forEach(element => {
            const productCategory = element.getAttribute('data-category');
            if (!productCategory) return;
            
            if (category === 'all' || productCategory.toLowerCase() === category.toLowerCase()) {
                element.classList.add('visible');
                element.classList.remove('hidden');
            } else {
                element.classList.add('hidden');
                element.classList.remove('visible');
            }
        });
        
        // Filter featured products
        featuredItems.forEach(item => {
            // Get category from the onclick attribute of the quick-add-btn
            const quickAddBtn = item.querySelector('.quick-add-btn');
            if (!quickAddBtn) return;
            
            const onclickAttr = quickAddBtn.getAttribute('onclick') || '';
            // Extract category from the addToCart function call
            const categoryMatch = onclickAttr.match(/addToCart\([^,]+,[^,]+,\s*'([^']+)'/);
            const itemCategory = categoryMatch ? categoryMatch[1] : null;
            
            if (!itemCategory) return;
            
            if (category === 'all' || itemCategory.toLowerCase() === category.toLowerCase()) {
                item.classList.add('visible');
                item.classList.remove('hidden');
            } else {
                item.classList.add('hidden');
                item.classList.remove('visible');
            }
        });
        
        console.log(`Filtering products by category: ${category}`);
    };

    window.checkListEmpty = function() {
        const isEmpty = shoppingList.length === 0;
        if (isEmpty) {
            console.log("Cart is empty");
        } else {
            console.log(`Cart contains ${shoppingList.length} items`);
        }
        return isEmpty;
    };

    window.countItems = function() {
        const count = shoppingList.length;
        console.log(`Cart items count: ${count}`);
        return count;
    };

    window.updateStats = function() {
        const count = countItems();
        
        // Update all UI elements showing cart count
        const itemCountElements = document.querySelectorAll('#itemCount, #cartCount');
        itemCountElements.forEach(element => {
            if (element) element.textContent = count;
        });
        
        // Update total cost display
        const totalCostElements = document.querySelectorAll('#totalCost');
        totalCostElements.forEach(element => {
            if (element) element.textContent = totalCost.toFixed(2);
        });
        
        console.log(`Stats updated: ${count} items, total cost: $${totalCost.toFixed(2)}`);
    };

    // Event listeners for search and filter functionality
    $(document).on('click', '#searchButton', function() {
        searchProducts();
    });

    $(document).on('submit', '#searchForm', function(e) {
        e.preventDefault();
        searchProducts();
    });
    
    $(document).on('input', '#searchInput', function() {
        searchProducts();
    });
    
    $(document).on('change', '#categoryFilter', function() {
        const category = $(this).val();
        filterByCategory(category);
    });
    
    $(document).on('submit', '#addItemForm', function(e) {
        e.preventDefault();
        addItem();
    });

    window.scrollToCart = function() {
        const cartSection = document.getElementById('cart-section');
        if (cartSection) {
            cartSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    function showCustomAlert(title, type, content = '') {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'custom-alert-overlay';
        
        // Create alert container
        const alertBox = document.createElement('div');
        alertBox.className = `custom-alert ${type}`;
        
        // Create close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'alert-close-btn';
        closeBtn.innerHTML = '<i class="fas fa-times"></i>';
        
        // Create title
        const alertTitle = document.createElement('h3');
        alertTitle.className = 'alert-title';
        alertTitle.textContent = title;
        
        // Create content container (if content provided)
        const alertContent = document.createElement('div');
        alertContent.className = 'alert-content';
        alertContent.innerHTML = content;
        
        // Assemble the alert box
        alertBox.appendChild(closeBtn);
        alertBox.appendChild(alertTitle);
        if (content) alertBox.appendChild(alertContent);
        
        // Add to overlay
        overlay.appendChild(alertBox);
        
        // Add to document
        document.body.appendChild(overlay);
        
        // Animate in
        setTimeout(() => {
            overlay.style.opacity = '1';
            alertBox.style.transform = 'translateY(0)';
        }, 10);
        
        // Close functionality
        closeBtn.addEventListener('click', closeAlert);
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                closeAlert();
            }
        });
        
        // Close when continue shopping button is clicked
        const continueBtn = alertBox.querySelector('.continue-shopping-btn');
        if (continueBtn) {
            continueBtn.addEventListener('click', closeAlert);
        }
        
        function closeAlert() {
            overlay.style.opacity = '0';
            alertBox.style.transform = 'translateY(-20px)';
            
            setTimeout(() => {
                document.body.removeChild(overlay);
            }, 300);
        }
    }

    function showToast(message) {
        // Create toast container if it doesn't exist
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 20px;
                display: flex;
                flex-direction: column;
                z-index: 1000;
            `;
            document.body.appendChild(toastContainer);
        }
        
        // Create toast element
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        toast.style.cssText = `
            background-color: #0000ff;
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            margin-top: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
            transform: translateX(-100%);
            transition: transform 0.3s ease;
        `;
        
        toastContainer.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 10);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.transform = 'translateX(-100%)';
            setTimeout(() => {
                toastContainer.removeChild(toast);
            }, 300);
        }, 3000);
    }

    // Initialize the application
    initialize();
    // Initialize cart on page load
    renderCart();

    // Product interaction with particles
    $('.product-card').on('click', function() {
        if (typeof animateProductClick === 'function') {
            const card = $(this);
            const cardOffset = card.offset();
            const cardWidth = card.width();
            const cardHeight = card.height();
            
            // Trigger particle effect at center of card
            animateProductClick(
                cardOffset.left + cardWidth/2,
                cardOffset.top + cardHeight/2
            );
        }
    });
    
    // Helper function for product click particle effect
    function animateProductClick(x, y) {
        for (let i = 0; i < 10; i++) {
            const particle = $('<div class="particle-cursor"></div>');
            const size = Math.random() * 8 + 4;
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 60 + 20;
            const color = '#0000ff';
            
            particle.css({
                left: `${x}px`,
                top: `${y}px`,
                width: `${size}px`,
                height: `${size}px`,
                backgroundColor: color,
                opacity: 0.7
            });
            
            $('body').append(particle);
            
            gsap.to(particle, {
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance,
                opacity: 0,
                duration: 0.8,
                ease: 'power2.out',
                onComplete: () => particle.remove()
            });
        }
    }

    // Add particle trail to Buy Now buttons
    $('.buy-now-btn').on('mouseenter', function() {
        $(this).attr('data-trail', 'active');
        const btn = $(this);
        
        function createTrail() {
            if (btn.attr('data-trail') === 'active') {
                const btnOffset = btn.offset();
                const x = btnOffset.left + Math.random() * btn.outerWidth();
                const y = btnOffset.top + btn.outerHeight() - 2;
                
                const particle = $('<div class="particle-cursor"></div>');
                particle.css({
                    left: `${x}px`,
                    top: `${y}px`,
                    width: '4px',
                    height: '4px',
                    backgroundColor: '#0000ff',
                    opacity: 0.7
                });
                
                $('body').append(particle);
                
                gsap.to(particle, {
                    y: y + (Math.random() * 10 + 15),
                    opacity: 0,
                    duration: 0.8,
                    ease: 'power1.out',
                    onComplete: () => particle.remove()
                });
                
                // Continue creating trail particles
                setTimeout(createTrail, 50);
            }
        }
        
        createTrail();
    });
    
    $('.buy-now-btn').on('mouseleave', function() {
        $(this).attr('data-trail', 'inactive');
    });

});

/**
 * Particles.js Configuration and Initialization
 * This file contains configurations for different particle effects used on the site
 */
document.addEventListener('DOMContentLoaded', function() {
    // Initialize different particle configurations for each section
    initializeParticles();
    
    // Setup cursor following particles
    setupCursorParticles();
    
    // Setup product interaction particles
    setupProductInteractionParticles();
});

/**
 * Initialize particles.js with different configurations for each section
 */
function initializeParticles() {
    // Common particle configuration based on showcase style
    const commonConfig = {
        "particles": {
            "number": {
                "value": 50,
                "density": {
                    "enable": true,
                    "value_area": 800
                }
            },
            "color": {
                "value": ["#0000ff", "#0066ff", "#3399ff"]
            },
            "shape": {
                "type": ["circle", "triangle"],
                "stroke": {
                    "width": 0,
                    "color": "#000000"
                },
            },
            "opacity": {
                "value": 0.2,
                "random": false,
                "anim": {
                    "enable": false,
                    "speed": 1,
                    "opacity_min": 0.1,
                    "sync": false
                }
            },
            "size": {
                "value": 4,
                "random": true,
                "anim": {
                    "enable": false,
                    "speed": 40,
                    "size_min": 0.1,
                    "sync": false
                }
            },
            "line_linked": {
                "enable": true,
                "distance": 150,
                "color": "#0000ff",
                "opacity": 0.2,
                "width": 1
            },
            "move": {
                "enable": true,
                "speed": 2,
                "direction": "none",
                "random": false,
                "straight": false,
                "out_mode": "out",
                "bounce": false,
            }
        },
        "interactivity": {
            "detect_on": "canvas",
            "events": {
                "onhover": {
                    "enable": true,
                    "mode": "repulse"
                },
                "onclick": {
                    "enable": true,
                    "mode": "push"
                },
                "resize": true
            },
            "modes": {
                "repulse": {
                    "distance": 100,
                    "duration": 0.4
                },
                "push": {
                    "particles_nb": 4
                }
            }
        },
        "retina_detect": true
    };

    // Apply to Hero section
    if (document.getElementById('particles-hero')) {
        particlesJS('particles-hero', JSON.parse(JSON.stringify(commonConfig)));
    }

    // Apply to Showcase section
    if (document.getElementById('particles-showcase')) {
        particlesJS('particles-showcase', JSON.parse(JSON.stringify(commonConfig)));
    }

    // Apply to Best Sellers section
    if (document.getElementById('particles-best-sellers')) {
        particlesJS('particles-best-sellers', JSON.parse(JSON.stringify(commonConfig)));
    }

    // Apply to Categories section
    if (document.getElementById('particles-categories')) {
        particlesJS('particles-categories', JSON.parse(JSON.stringify(commonConfig)));
    }

    // Apply to Shopping Cart section
    if (document.getElementById('particles-cart')) {
        particlesJS('particles-cart', JSON.parse(JSON.stringify(commonConfig)));
    }

    // Apply to Footer section (slight variation for readability)
    if (document.getElementById('particles-footer')) {
        let footerConfig = JSON.parse(JSON.stringify(commonConfig));
        footerConfig.particles.color.value = "#ffffff";
        footerConfig.particles.line_linked.color = "#ffffff";
        particlesJS('particles-footer', footerConfig);
    }
}




