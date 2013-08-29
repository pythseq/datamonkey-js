/*

  Datamonkey - An API for comparative analysis of sequence alignments using state-of-the-art statistical models.

  Copyright (C) 2013
  Sergei L Kosakovsky Pond (spond@ucsd.edu)
  Steven Weaver (sweaver@ucsd.edu)

  Permission is hereby granted, free of charge, to any person obtaining a
  copy of this software and associated documentation files (the
  "Software"), to deal in the Software without restriction, including
  without limitation the rights to use, copy, modify, merge, publish,
  distribute, sublicense, and/or sell copies of the Software, and to
  permit persons to whom the Software is furnished to do so, subject to
  the following conditions:

  The above copyright notice and this permission notice shall be included
  in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
  OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
  CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
  TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

var dpl       = require( ROOT_PATH + '/lib/datamonkey-pl.js'),
    error     = require( ROOT_PATH + '/lib/error.js'),
    helpers   = require( ROOT_PATH + '/lib/helpers.js'),
    globals   = require( ROOT_PATH + '/config/globals.js'),
    fs        = require('fs'),
    jobproxy  = require( ROOT_PATH + "/lib/hivcluster.js"),
    hiv_setup = require( ROOT_PATH + '/config/hiv_cluster_globals');

var mongoose = require('mongoose'),
    HivCluster = mongoose.model('HivCluster');


// app.get('/hivclustering', msa.showUploadForm);
exports.clusterForm = function (req, res) {
  res.render('hivcluster/form.ejs', {'validators': HivCluster.validators()});
};

exports.results = function (req, res) {

  // HIV Cluster id
  var id = req.params.id;
  HivCluster.findOne({_id: id}, 'graph_dot cluster_csv', function (err, hiv_cluster) {
    if (err || !hiv_cluster) {
      res.json(500, error.errorResponse('There is no HIV Cluster job with id of ' + id));
    } else {
      console.log(hiv_cluster);
      res.json(200, {'hiv_cluster': hiv_cluster});
    }
  });

}

exports.jobPage = function (req, res) {

  // HIV Cluster id
  var id = req.params.id;
  HivCluster.findOne({_id: id}, function (err, hiv_cluster) {
    if (err || !hiv_cluster) {
      res.json(500, error.errorResponse('There is no HIV Cluster job with id of ' + id));
    } else {
      res.format({
        html: function(){
          res.render('hivcluster/jobpage.ejs', {hiv_cluster : hiv_cluster});
        },
        json: function(){
          res.json(200, {'result': hiv_cluster});
        }
      });
    }
  });

}

exports.invokeClusterAnalysis = function (req, res) {

  var hiv_cluster = new HivCluster;
  var postdata = req.body;
  hiv_cluster.distance_threshold = postdata.distance_threshold;
  hiv_cluster.min_overlap        = postdata.min_overlap;
  hiv_cluster.ambiguity_handling = postdata.ambiguity_handling;
  hiv_cluster.status             = hiv_setup.valid_statuses[0];

  // Parameters checkout out. Validate upload file.
  if (req.files.files.size == 0) {
    // Show form again
    res.format({
      html: function(){
        res.render('hivcluster/form.ejs', {'errors' : { 'file' : "Empty File"}, 'validators': HivCluster.validators() });
      },
      json: function(){
        res.json(200, {'err': "Empty File"});
      }
    });
    return;
  }

  HivCluster.validateFasta(req.files.files.path, function(result) {
    if(!result.success) {
      // Show form again
      res.format({
        html: function(){
          res.render('hivcluster/form.ejs', {'errors': { 'file' : result.msg }, 'validators': HivCluster.validators() });
        },
        json: function(){
          res.json(200, {'err': "Empty File"});
        }
      });
    } else {
      hiv_cluster.save(function (err, result) {
        if(err) {
            res.format({
              html: function(){
                console.log(err);
                res.render('hivcluster/form.ejs', {'errors': err.errors, 'validators': HivCluster.validators()});
              },

              json: function(){
                res.json(200, {'result': data});
              }
            });
        } else {
          fs.readFile(req.files.files.path, function (err, data) {
            var new_path = result.filepath;
            fs.writeFile(new_path, data, function (err) {
              var hpcsocket = new jobproxy.HPCSocket(result);
              res.redirect('./' + result._id);
            });
          }); 
        }
      });
    } 
  });
}
