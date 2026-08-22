/* ─────────────────────────────────────────────────────────────
   MoodHand 3D Gloss Avatar Rig (Gloss Vinyl Figure & Scene)
   ───────────────────────────────────────────────────────────── */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { rngFrom, pick, jit, getComputedThemeColors } from './draw-engine.js';
import { MOOD_DATABASE } from './config.js';
import { eggState } from './avatar-scene.js';

export class Avatar3DRig {
  constructor(container) {
    this.container = container;
    this.canvas = null;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.characterGroup = null;
    this.headGroup = null;
    this.faceMeshes = {};
    this.petGroup = null;

    this.isInitialized = false;
    this.isDragging = false;
    this.previousPointerPosition = { x: 0, y: 0 };
    this.targetRotation = { x: 0, y: 0 };
    this.currentRotation = { x: 0, y: 0 };
    this.jumpProgress = 1;
    this.jumpStartTime = 0;
    this.clock = new THREE.Clock();

    this.init();
  }

  init() {
    if (this.isInitialized) return;

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(this.container.clientWidth || 300, this.container.clientHeight || 180);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.canvas = this.renderer.domElement;
    this.canvas.className = 'avatar-3d-canvas';
    this.canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:none;z-index:3;cursor:grab;touch-action:none;';
    this.container.appendChild(this.canvas);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(40, (this.container.clientWidth || 300) / (this.container.clientHeight || 180), 0.1, 100);
    this.camera.position.set(0, 0.02, 2.25);
    this.camera.lookAt(0, 0, 0);

    this.setupLighting();
    this.setupInteraction();

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);

    this.resizeObserver = new ResizeObserver(() => this.onResize());
    this.resizeObserver.observe(this.container);

    this.isInitialized = true;
  }

  setupLighting() {
    // 柔和环境光
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xd8cebb, 1.2);
    this.scene.add(hemiLight);

    // 主摄影棚顶光 (Key Light)
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
    keyLight.position.set(2, 4, 3.5);
    keyLight.castShadow = true;
    this.scene.add(keyLight);

    // 暖色侧补光 (Fill Light)
    const fillLight = new THREE.DirectionalLight(0xffecd0, 1.3);
    fillLight.position.set(-3, 1, 2.5);
    this.scene.add(fillLight);

    // 轮廓光 (Rim Kicker)
    const rimLight = new THREE.DirectionalLight(0xddeeff, 2.0);
    rimLight.position.set(0, 3, -3);
    this.scene.add(rimLight);
  }

  setupInteraction() {
    const onPointerDown = (e) => {
      this.isDragging = true;
      this.canvas.style.cursor = 'grabbing';
      const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
      this.previousPointerPosition = { x: clientX, y: clientY };
    };

    const onPointerMove = (e) => {
      const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;

      if (this.isDragging) {
        const deltaX = clientX - this.previousPointerPosition.x;
        const deltaY = clientY - this.previousPointerPosition.y;
        this.targetRotation.y += deltaX * 0.015;
        this.targetRotation.x += deltaY * 0.01;
        this.targetRotation.x = Math.max(-0.4, Math.min(0.4, this.targetRotation.x));
        this.previousPointerPosition = { x: clientX, y: clientY };
      } else if (this.headGroup) {
        const rect = this.container.getBoundingClientRect();
        const nx = (clientX - rect.left) / rect.width - 0.5;
        const ny = (clientY - rect.top) / rect.height - 0.5;
        this.headGroup.rotation.y = nx * 0.35;
        this.headGroup.rotation.x = ny * 0.25;
      }
    };

    const onPointerUp = () => {
      this.isDragging = false;
      this.canvas.style.cursor = 'grab';
    };

    this.canvas.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    this.canvas.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);
  }

  onResize() {
    if (!this.renderer || !this.camera) return;
    const w = this.container.clientWidth || 300;
    const h = this.container.clientHeight || 180;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  makeGlossMaterial(colorHex, isMetallic = false) {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(colorHex),
      roughness: isMetallic ? 0.15 : 0.25,
      metalness: isMetallic ? 0.75 : 0.08,
    });
  }

  build(seedStr, moodKey) {
    if (this.characterGroup) {
      this.scene.remove(this.characterGroup);
      this.disposeHierarchy(this.characterGroup);
    }

    const rng = rngFrom(seedStr);
    const themeColors = getComputedThemeColors();
    const moodData = MOOD_DATABASE[moodKey] || MOOD_DATABASE.happy;

    this.characterGroup = new THREE.Group();
    this.scene.add(this.characterGroup);

    // 材质
    const skinMat = this.makeGlossMaterial('#FFF6EA');
    const clothMat = this.makeGlossMaterial(themeColors.accent);
    const inkMat = this.makeGlossMaterial(themeColors.ink);
    const goldMat = this.makeGlossMaterial('#FFD700', true);
    const blushMat = new THREE.MeshBasicMaterial({ color: 0xff7b7b, transparent: true, opacity: 0.65 });
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.1 });

    // 1. 地面底座
    const groundMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7, transparent: true, opacity: 0.22 });
    const ground = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.04, 32), groundMat);
    ground.position.y = -0.72;
    this.characterGroup.add(ground);

    // 2. 身体 (Torso / Clothes)
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.32, 0.38, 16, 24), clothMat);
    torso.position.set(0, -0.22, 0);
    this.characterGroup.add(torso);

    // 3. 头部 (Head Group)
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.32, 0);
    this.characterGroup.add(this.headGroup);

    const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.42, 32, 32), skinMat);
    this.headGroup.add(headMesh);

    // 4. 五官 (Eyes, Cheeks, Mouth)
    const eyeGeom = new THREE.SphereGeometry(0.042, 16, 16);
    const eyeL = new THREE.Mesh(eyeGeom, eyeMat);
    eyeL.position.set(-0.14, 0.02, 0.40);
    const eyeR = new THREE.Mesh(eyeGeom, eyeMat);
    eyeR.position.set(0.14, 0.02, 0.40);

    // 高光小点
    const glintGeom = new THREE.SphereGeometry(0.014, 8, 8);
    const glintMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const glintL = new THREE.Mesh(glintGeom, glintMat);
    glintL.position.set(-0.01, 0.015, 0.035);
    eyeL.add(glintL);
    const glintR = new THREE.Mesh(glintGeom, glintMat);
    glintR.position.set(-0.01, 0.015, 0.035);
    eyeR.add(glintR);

    this.headGroup.add(eyeL);
    this.headGroup.add(eyeR);

    // 腮红
    const blushL = new THREE.Mesh(new THREE.CircleGeometry(0.055, 16), blushMat);
    blushL.position.set(-0.22, -0.06, 0.38);
    blushL.rotation.y = -0.3;
    const blushR = new THREE.Mesh(new THREE.CircleGeometry(0.055, 16), blushMat);
    blushR.position.set(0.22, -0.06, 0.38);
    blushR.rotation.y = 0.3;
    this.headGroup.add(blushL);
    this.headGroup.add(blushR);

    // 嘴巴
    if (moodKey === 'happy' || eggState.isHeart) {
      const smile = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.014, 8, 16, Math.PI), inkMat);
      smile.position.set(0, -0.11, 0.41);
      smile.rotation.x = Math.PI;
      this.headGroup.add(smile);
    } else {
      const dotMouth = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), inkMat);
      dotMouth.position.set(0, -0.11, 0.42);
      this.headGroup.add(dotMouth);
    }

    // 5. 3D 发型与头饰 (Hairstyles)
    const hairStyle = Math.floor(rng() * 6);

    if (eggState.specialKeyword === 'cat') {
      const earGeom = new THREE.ConeGeometry(0.12, 0.2, 16);
      const earMat = this.makeGlossMaterial(themeColors.accent);
      const earL = new THREE.Mesh(earGeom, earMat);
      earL.position.set(-0.24, 0.38, 0.05);
      earL.rotation.z = 0.3;
      const earR = new THREE.Mesh(earGeom, earMat);
      earR.position.set(0.24, 0.38, 0.05);
      earR.rotation.z = -0.3;
      this.headGroup.add(earL);
      this.headGroup.add(earR);
    } else if (eggState.isKoi) {
      const crownMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.16, 0.14, 6), goldMat);
      crownMesh.position.set(0, 0.48, 0);
      this.headGroup.add(crownMesh);
    } else if (hairStyle === 0) {
      // 豆芽呆毛
      const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.18, 8), inkMat);
      stalk.position.set(0, 0.48, 0);
      stalk.rotation.z = -0.2;
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), this.makeGlossMaterial('#53A548'));
      leaf.position.set(-0.05, 0.58, 0);
      leaf.scale.set(1.4, 0.5, 0.8);
      this.headGroup.add(stalk);
      this.headGroup.add(leaf);
    } else if (hairStyle === 1) {
      // 贝雷帽
      const beret = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.4, 0.1, 24), this.makeGlossMaterial(themeColors.accent));
      beret.position.set(0, 0.4, 0.02);
      beret.rotation.z = -0.15;
      const pom = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 12), skinMat);
      pom.position.set(-0.05, 0.48, 0.02);
      this.headGroup.add(beret);
      this.headGroup.add(pom);
    } else if (hairStyle === 2) {
      // 头戴式耳机
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.028, 12, 32, Math.PI), inkMat);
      band.position.set(0, 0.12, 0);
      const cupGeom = new THREE.CylinderGeometry(0.12, 0.12, 0.08, 16);
      const cupMat = this.makeGlossMaterial(themeColors.accent);
      const cupL = new THREE.Mesh(cupGeom, cupMat);
      cupL.position.set(-0.44, 0.12, 0);
      cupL.rotation.z = Math.PI / 2;
      const cupR = new THREE.Mesh(cupGeom, cupMat);
      cupR.position.set(0.44, 0.12, 0);
      cupR.rotation.z = Math.PI / 2;
      this.headGroup.add(band);
      this.headGroup.add(cupL);
      this.headGroup.add(cupR);
    } else {
      // 双丸子头
      const bunGeom = new THREE.SphereGeometry(0.13, 16, 16);
      const bunL = new THREE.Mesh(bunGeom, inkMat);
      bunL.position.set(-0.32, 0.36, 0);
      const bunR = new THREE.Mesh(bunGeom, inkMat);
      bunR.position.set(0.32, 0.36, 0);
      this.headGroup.add(bunL);
      this.headGroup.add(bunR);
    }

    // 6. 手臂与腿部
    const armGeom = new THREE.CapsuleGeometry(0.07, 0.28, 8, 16);
    const armL = new THREE.Mesh(armGeom, skinMat);
    armL.position.set(-0.35, -0.15, 0);
    armL.rotation.z = 0.3;
    const armR = new THREE.Mesh(armGeom, skinMat);
    armR.position.set(0.35, -0.15, 0);
    armR.rotation.z = -0.3;
    this.characterGroup.add(armL);
    this.characterGroup.add(armR);

    // 腿与鞋子
    const legGeom = new THREE.CylinderGeometry(0.06, 0.06, 0.24, 12);
    const shoeGeom = new THREE.CapsuleGeometry(0.07, 0.1, 8, 16);
    const legL = new THREE.Mesh(legGeom, inkMat);
    legL.position.set(-0.14, -0.52, 0);
    const shoeL = new THREE.Mesh(shoeGeom, inkMat);
    shoeL.position.set(-0.14, -0.64, 0.03);
    shoeL.rotation.x = Math.PI / 2;
    const legR = new THREE.Mesh(legGeom, inkMat);
    legR.position.set(0.14, -0.52, 0);
    const shoeR = new THREE.Mesh(shoeGeom, inkMat);
    shoeR.position.set(0.14, -0.64, 0.03);
    shoeR.rotation.x = Math.PI / 2;
    this.characterGroup.add(legL);
    this.characterGroup.add(shoeL);
    this.characterGroup.add(legR);
    this.characterGroup.add(shoeR);

    // 7. 3D 专属伴侣宠物 (卡皮巴拉水豚伴侣)
    this.petGroup = new THREE.Group();
    this.petGroup.position.set(0.62, -0.5, 0.15);
    this.characterGroup.add(this.petGroup);

    const capyMat = this.makeGlossMaterial('#A07855');
    const capyBody = new THREE.Mesh(new THREE.CapsuleGeometry(0.14, 0.18, 12, 16), capyMat);
    capyBody.rotation.z = Math.PI / 2;
    this.petGroup.add(capyBody);

    const orange = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 12), this.makeGlossMaterial('#FF9800'));
    orange.position.set(0, 0.17, 0);
    this.petGroup.add(orange);

    const capyEyeL = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 8), eyeMat);
    capyEyeL.position.set(-0.05, 0.05, 0.14);
    const capyEyeR = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 8), eyeMat);
    capyEyeR.position.set(0.05, 0.05, 0.14);
    this.petGroup.add(capyEyeL);
    this.petGroup.add(capyEyeR);

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  jump() {
    this.jumpStartTime = this.clock.getElapsedTime();
    this.jumpProgress = 0;
  }

  animate() {
    requestAnimationFrame(this.animate);
    const t = this.clock.getElapsedTime();

    if (this.characterGroup) {
      this.currentRotation.y += (this.targetRotation.y - this.currentRotation.y) * 0.1;
      this.currentRotation.x += (this.targetRotation.x - this.currentRotation.x) * 0.1;
      this.characterGroup.rotation.y = this.currentRotation.y;
      this.characterGroup.rotation.x = this.currentRotation.x;

      const breath = Math.sin(t * 2.5) * 0.02;
      this.characterGroup.position.y = breath;

      if (this.petGroup) {
        this.petGroup.rotation.y = Math.sin(t * 1.8) * 0.1;
      }

      if (this.jumpProgress < 1) {
        const dt = t - this.jumpStartTime;
        const dur = 0.45;
        this.jumpProgress = Math.min(1, dt / dur);
        const jumpH = Math.sin(this.jumpProgress * Math.PI) * 0.3;
        this.characterGroup.position.y = breath + jumpH;
      }
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  setVisible(visible) {
    if (this.canvas) {
      this.canvas.style.display = visible ? 'block' : 'none';
      if (visible) this.onResize();
    }
  }

  disposeHierarchy(obj) {
    obj.traverse((child) => {
      if (child.isMesh) {
        child.geometry?.dispose();
        if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
        else child.material?.dispose();
      }
    });
  }
}
