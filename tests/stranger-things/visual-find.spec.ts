import {test, expect, Page} from '@playwright/test';
import {BoundingBox, findAllVisualMatches, findVisualMatch, getCenterPoint} from "../helpers/visualSearch";

test('visual-find', async ({page}) => {
    test.slow()

    await page.goto(`https://xotabu4.github.io/`)
    await page.waitForTimeout(1000)
    await page.locator(".fa-keyboard").scrollIntoViewIfNeeded()
    await page.waitForTimeout(1000)

    const base = await page.screenshot({ type: 'png', fullPage: true })

    const normalBox = await page.locator('div:nth-child(2) > .service-item > .fa-stack > .svg-inline--fa.fa-circle').first().boundingBox()
    const strangerBox = await findVisualMatch(base, './tests/visual-selectors/img.png', { threshold: 0.8 });
    const allStrangerBoxes = await findAllVisualMatches(base, './tests/visual-selectors/img.png', { threshold: 0.95 });


    console.log('normalBox |>', normalBox);
    await drawBox(page, normalBox as BoundingBox, 'red', 'Normal Selector');


    console.log('strangerBox |>', strangerBox);
    await drawBox(page, strangerBox, 'blue', 'Visual Selector');

    console.log('allStrangerBoxes |>', allStrangerBoxes);
    for (let i = 0; i < allStrangerBoxes.length; i++) {
        await drawBox(page, allStrangerBoxes[i], 'green', `Visual Selector ${i+1}`);
    }

    const {x, y} = getCenterPoint(strangerBox)
    await page.mouse.click(x,y);
});


async function drawBox(page: Page, box: BoundingBox, color = 'red', label = '') {
    await page.evaluate(({x, y, width, height, color, label}) => {
        const div = document.createElement('div');
        div.style.position = 'absolute';
        div.style.left = `${x}px`;
        div.style.top = `${y}px`;
        div.style.width = `${width}px`;
        div.style.height = `${height}px`;
        div.style.border = `3px solid ${color}`;
        div.style.pointerEvents = 'none';
        div.style.zIndex = '10000';
        div.style.boxSizing = 'border-box';

        if (label) {
            div.style.backgroundColor = `${color}33`; // Полупрозрачный фон
            const text = document.createElement('span');
            text.textContent = label;
            text.style.position = 'absolute';
            text.style.top = '2px';
            text.style.left = '2px';
            text.style.color = color;
            text.style.fontWeight = 'bold';
            text.style.fontSize = '12px';
            text.style.backgroundColor = 'white';
            text.style.padding = '2px 4px';
            div.appendChild(text);
        }

        document.body.appendChild(div);
    }, {x: box.x, y: box.y, width: box.width, height: box.height, color, label});
}