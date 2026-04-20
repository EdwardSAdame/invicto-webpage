$w.onReady(function () {

    // 1. Change text onClick event

    // Set the text when the page loads
    $w('#title').text = 'Hello World';

    // Change the text when the button is clicked //
    $w('#changeTextBtn').onClick(() => {
        $w('#title').text = 'I’m a Wix developer';
    });

    // 2. Hide and show elements

    // Set shadesOfBlueImage as hidden & set button label
    $w('#shadesOfBlueImage').hide();
    $w('#showHideBtn').label = "Show Blue Image"

    // Hide one image, show the other & change the button label
    $w('#showHideBtn').onClick(() => {
        if ($w('#shadesOfBlueImage').hidden) {
            $w('#shadesOfBlueImage').show();
            $w('#abstractShapesImage').hide();
            $w('#showHideBtn').label = "Show Abstract Image"
        } else {
            $w('#shadesOfBlueImage').hide();
            $w('#abstractShapesImage').show();
            $w('#showHideBtn').label = "Show Blue Image"
        }
    });
});

// 3. Use dynamic selectors

function toggleFold(index) {
    let $fold = $w('#fold' + index);
    let $arrowDown = $w('#arrowDown' + index);
    let $arrowRight = $w('#arrowRight' + index);

    // toggle the fold at the index
    if ($fold.collapsed) {
        $fold.expand();
        $arrowDown.show();
        $arrowRight.hide();
    } else {
        $fold.collapse();
        $arrowDown.hide();
        $arrowRight.show();
    }

    // collapse the other folds
    [1, 2, 3]
    .filter(idx => idx !== index)
        .forEach(idx => {
            $w('#fold' + idx).collapse(); // Corrected typo
            $w('#arrowDown' + idx).hide();
            $w('#arrowRight' + idx).show();
        });
}

$w('#headerBox1').onClick(() => toggleFold(1))
$w('#headerBox2').onClick(() => toggleFold(2))
$w('#headerBox3').onClick(() => toggleFold(3))