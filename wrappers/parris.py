#  Datamonkey - An API for comparative analysis of sequence alignments using
#  state-of-the-art statistical models.
#
#  Copyright (C) 2013
#  Sergei L Kosakovsky Pond (spond@ucsd.edu)
#  Steven Weaver (sweaver@ucsd.edu)
#
#  Permission is hereby granted, free of charge, to any person obtaining a
#  copy of this software and associated documentation files (the
#  "Software"), to deal in the Software without restriction, including
#  without limitation the rights to use, copy, modify, merge, publish,
#  distribute, sublicense, and/or sell copies of the Software, and to
#  permit persons to whom the Software is furnished to do so, subject to
#  the following conditions:
#
#  The above copyright notice and this permission notice shall be included
#  in all copies or substantial portions of the Software.
#
#  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
#  OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
#  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
#  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
#  CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
#  TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
#  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


import dm
import msa

def parris_analysis(msaid, treemode, namedmodel, modelstring, pvalue,
                    sendmail=False, block=False):
    u"""Starts a new parris for the given sequence."""

    # We need to have an option of whether they want mail
    # and/or want the call to block until finished, or neither
    method = "/msa/{0}/parris".format(msaid)

    response = dm.post(method, msaid=msaid, treemode=treemode,
                       namedmodel=namedmodel, modelstring=modelstring,
                       pvalue=pvalue, sendmail=sendmail, block=block)

    return response

def get_parris_status(msaid, parrisid):
    u"""Returns current status of job"""

    method = "/msa/{0}/parris/{1}".format(msaid, parrisid)
    response = dm.get(method, params=None)
    return response

def get_parris_results(msaid, parrisid):
    u"""Returns results for analysis, or error if there is none"""

    method = "/msa/{0}/parris/{1}/results".format(msaid, parrisid)
    response = dm.get(method, params=None)
    return response

if __name__ == "__main__":
    mail = 'sweaver@ucsd.edu'
    fn   = './res/HIV_gp120.nex'
    msa = msa.create_msa(fn, 0, 0, mail)
    print msa

    #Neighbor Joining
    treemode    = 0
    namedmodel  = ""
    modelstring = "010010"
    pvalue      = 0.1
    sendmail    = True

    #Start analysis. Receive ticket.
    parris = parris_analysis(msa["msaid"], treemode, namedmodel, modelstring, pvalue, sendmail)

    print msa["msaid"]
    print parris

