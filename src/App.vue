<template>
<div id="app">
    <!-- 首屏 -->
    <section class="screen launch">
        <div class="screen-inner">
            <!-- 壁纸 -->
            <div class="wallpaper">
                <div class="filter-layer"></div>
            </div>
            <!-- content -->
            <div class="content">
                <svg class="name" viewBox="0 0 630 180">
                    <text x="50%" y="50%" dy=".35em">Cong Min</text>
                </svg>
            </div>
            <!-- 更多 -->
            <!-- <div class="scroll-down"></div> -->
        </div>
    </section>
    <!-- 信息屏 -->
    <section class="screen info">
        <div class="screen-inner">
            <!-- 壁纸 -->
            <div class="wallpaper">
                <div class="filter-layer"></div>
            </div>
            <!-- content -->
            <div class="content">
                <!-- name -->
                <svg class="name" viewBox="0 0 630 180">
                    <text x="50%" y="50%" dy=".35em">Cong Min</text>
                </svg>
                <!-- motto -->
                <div class="motto">
                    <a href="https://github.com/mcc108" title="Blog" target="_blank">Think</a>
                    &
                    <a href="https://resume.congm.in" title="Github" target="_blank">Different</a>.
                </div>
            </div>
        </div>
    </section>
</div>
</template>

<script>
export default {
    name: 'App',
};
</script>

<style lang="less">
@bing-bg: url('https://congm.in/bing'); // bing 壁纸
@body-bg: #fafafa;

body {
    position: relative;
    user-select: none;
    overflow-x: hidden;
    overflow-y: auto;
    background-color: @body-bg;
}
// 多屏滚动
.screen {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    .screen-inner {
        // 利用 absolute + clip: rect() 将 fixed 的内容裁剪掉
        position: absolute;
        clip: rect(auto auto auto auto);
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: auto;
    }
}
// 壁纸
.wallpaper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: @bing-bg center center no-repeat #aaa;
    background-size: cover;
    pointer-events: none;
    transform: perspective(0); // fixbug: clip fixed
}
// 滤镜层
@filter-layer-bg1: rgba(61,66,96,0.4);
@filter-layer-bg2: rgba(31,34,49,0.6);
.filter-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: @filter-layer-bg1;
    background-image: linear-gradient(140deg, @filter-layer-bg1 15%, @filter-layer-bg2);
    pointer-events: none;
    opacity: 0.9;
}
// 内容
.content {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate3d(-50%, -110px, 0) perspective(0); // perspective fixbug: clip fixed
    width: 100%;
    box-sizing: border-box;
    padding: 0 30px 30px;
    text-align: center;
    // 姓名
    svg.name {
        display: block;
        width: 100%;
        max-width: 630px;
        margin: 0 auto;
        text {
            font-size: 140px;
            font-family: Ubuntu;
            fill: #fff;
            stroke: #fff;
            stroke-linejoin: round;
            stroke-width: 5px;
            text-anchor: middle;
        }
    }
    // 链接
    a {
        color: #fff;
        text-decoration: none;
        &:hover {
            text-decoration: underline dashed;
        }
    }
}
.scroll-down {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translate3d(-50%, -10px, 0);
}
/* 首屏 */
.screen.launch {
    color: #fff;
    .wallpaper {
        z-index: -1;
    }
}
/* 信息屏 */
.screen.info {
    background: @body-bg;
    color: #222;
    .wallpaper {
        display: none;
    }
    .content {
        svg.name text {
            fill: #222;
            stroke: #222;
        }
        .motto {
            font-size: 20px;
            padding: 20px;
            white-space: normal;
        }
        a {
            color: #000;
            &:hover {
                color: #555;
            }
        }
    }
    // 如果支持 mix-blend-mode 混合模式, 则将壁纸与名字混合
    @supports (mix-blend-mode: multiply) and (mix-blend-mode: screen) {
        mix-blend-mode: multiply;
        .filter-layer {
            opacity: .6;
        }
        .wallpaper {
            display: block;
            z-index: 1;
            mix-blend-mode: screen;
        }
        .content {
            svg.name text {
                fill: #000;
                stroke: #000;
            }
        }
    }
}
</style>
