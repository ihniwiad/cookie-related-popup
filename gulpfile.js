require( 'dotenv' ).config();
const envConfig = process.env;

const gulp = require( 'gulp' );
const { series, parallel } = require( 'gulp' );
const clean = require( 'gulp-clean' );


const paths = {
    php: {
        watchSrc: [ '*.php' ],
    },
};

// PUBLISH HOWTO: 
// If you like to copy your files to another folder after build make 
// `.env` file with content `PUBLISH_PATH=path_to_your_folder`, 
// e.g. `PUBLISH_PATH=../../../../../Applications/MAMP/htdocs/`
// Have a look at `publishConfig` which files to include / exclude
// and how to name your created destination folder
// 
// NOTE: within `src` all (1..n) non-negative globs must be followed by (0..n) only negative globs
const publishConfig = {
    "src": [
        "**/*",
        "!**/node_modules",
        "!**/node_modules/**", 
    ],
    "base": ".",
    "folderName": "cookie-related-popup",
};

// NOTE: take care at this path since you’re deleting files outside your project
const publishFullPath = envConfig.PUBLISH_PATH + '/' + publishConfig.folderName;


const publishFolderDelete = ( cb ) => {

    if ( !! envConfig.PUBLISH_PATH && !! publishConfig.folderName ) {
        // console.log( 'delete: ' + publishFullPath );
        return gulp.src( publishFullPath, { read: false, allowEmpty: true } )
            .pipe( clean( { force: true } ) ) // NOTE: take care at this command since you’re deleting files outside your project
        ;
    }
    else {
        // log note, do nothing
        console.log( 'Note: Nothing deleted since publish configuration empty.' );
    }

    cb();
}

const publishFolderCreate = ( cb ) => {

    if ( !! envConfig.PUBLISH_PATH && !! publishConfig.folderName ) {
        // console.log( 'create: ' + publishFullPath + ' (src: ' + publishConfig.src + ', base: ' + publishConfig.base + ')' );
        return gulp.src( publishConfig.src, { base: publishConfig.base } )
            .pipe( gulp.dest( publishFullPath ) )
        ;
    }
    else {
        // log note, do nothing
        console.log( 'Note: No publishing done since publish configuration empty.' );
    }

    cb();
}

const publish = series(
    // copy all project but `node_modules` to configured dest
    publishFolderDelete,
    publishFolderCreate,
);

exports.publish = publish;


function allWatch() {
    gulp.watch( paths.php.watchSrc, publish );
}

exports.watch = allWatch;


const build = series(
    publish,
);

exports.build = build;




