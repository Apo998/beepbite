import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { Draggable } from 'gsap/Draggable';
import Lenis from 'lenis';

Object.assign(window, { gsap, ScrollTrigger, SplitText, DrawSVGPlugin, Draggable, Lenis });
gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, Draggable);
