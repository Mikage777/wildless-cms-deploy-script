# wildless-cms-deploy-script

Helper scripts deploy to platform

### Prepare config

rename `.config.example.js` to `.config.js`

### How to use:

Example: node wcms-deploy.js addNewTags rc 24085 "Enter a comment for the tag"

* node - is the script call command
* wcms-deploy.js - name of script 
* addNewTags - a function from the script (this function creates a new tag or tags if the project id is not passed)
* rc - a branch for tag creation
* 24085 - is the id of the project in which you want to run the script
* "Enter a comment for the tag" - a comment for the created tag (similar functionality in gitlab is the "message" field)
