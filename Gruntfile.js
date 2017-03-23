module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        concat: {
            "options": { "separator": ";" },
            "build": {
                "src": ["app/models/Stream.js", "app/models/QueryInfo.js", "app/helpers/JSONPHandler.js", "app/services/SearchStreamsService.js", 
                "app/helpers/templateFetcher.js", "app/components/BaseViewComponent.js",
                "app/components/StreamListItem.js", "app/components/StreamsList.js", 
                "app/controllers/SearchListController.js", "app/app.js"],
                "dest": "main.js"
            }
        },
        uglify: {
            my_target: {
                files: {
                    'main.js': ['main.js']
                }
            }
        },
        cssmin: {
            options: {
                mergeIntoShorthands: false,
                roundingPrecision: -1
            },
            target: {
                files: {
                'content/main.css': ['app/styles/*.css']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    grunt.registerTask('default', ['concat', 'uglify', 'cssmin']);
};