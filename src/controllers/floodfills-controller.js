'use strict';

import express from 'express';
import asyncHandler from 'express-async-handler';
import { FloodFillsService } from '../services/floodfills-service.js';
import { FloodFillNotFoundError } from '../services/floodfill-not-found-error.js';
import { ExpressError } from '../express-error.js';

/**
 * @openapi
 * components:
 *   schemas:
 *     FloodFill:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           format: int32
 *         name:
 *           type: string
 *         sizeX:
 *           type: integer
 *           format: int32
 *         sizeY:
 *           type: integer
 *           format: int32 
 *         colors:
 *           type: array
 *           items:
 *             type: string 
 *         pixels:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/Pixel"
 *       required: [ name, sizeX, sizeY, colors ]
 *     FloodFillCreate:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         sizeX:
 *           type: integer
 *           format: int32
 *         sizeY:
 *           type: integer
 *           format: int32 
 *         colors:
 *           type: array
 *           items:
 *             type: string 
 *       required: [ name ]
 *     FloodFillUpdate:
 *       type: object
 *       properties:
 *         x:
 *           type: integer
 *           format: int32
 *         y:
 *           type: integer
 *           format: int32
 *         color:
 *           type: string
 *     Pixel:
 *       type: object
 *       properties:
 *         x:
 *           type: integer
 *           format: int32
 *         y:
 *           type: integer
 *           format: int32
 *         color:
 *           type: string
 */
export class FloodFillsController {
  /**
   * Hooks up the floodfillss REST-routes to their respective implementations in the provided floodfills service.
   * @param {express.Express} app The Express app to add the floodfills routes to.
   * @param {FloodFillsService} service The floodfills service implementing the floodfills operations.
   */
  static registerRoutes(app, service) {
    /**
     * @openapi
     * /floodfills:
     *    get:
     *      summary: Gets all floodfills the userId owns
     *      operationId: GetAllFloodFills
     *      tags: [ FloodFills ]
     *      parameters:
     *       - name: userid
     *         in: header
     *         required: true
     *         schema:
     *           type: string
     *      responses:
     *        200:
     *          description: Successful operation
     *          content:
     *            application/json:
     *              schema:
     *                type: array
     *                items:
     *                  $ref: "#/components/schemas/FloodFill"
     */
    app.get('/floodfills', asyncHandler(async (req, res) => {
      res.json(await service.getAll(req.headers.userid))
    }));

    /**
     * @openapi
     * /floodfills:
     *   post:
     *     summary: Adds a new floodfill
     *     operationId: AddFloodFill
     *     tags: [ FloodFills ]
     *     parameters:
     *       - name: userid
     *         in: header
     *         required: true
     *         schema:
     *           type: string
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: "#/components/schemas/FloodFillCreate"
     *     responses:
     *       "200":
     *         description: successful operation
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id:
     *                   type: integer
     *                   format: int32
     */
    app.post('/floodfills', asyncHandler(async (req, res) => {
      const floodfillId = await service.add(req.headers.userid, req.body);
      res.json({ id: floodfillId });
    }));
    
    /**
     * @openapi
     * "/floodfills/{floodfillId}":
     *   get:
     *     summary: Finds floodfill by ID
     *     operationId: GetfloodfillByID
     *     tags: [ FloodFills ]
     *     parameters:
     *       - name: userid
     *         in: header
     *         required: true
     *         schema:
     *           type: string
     *       - name: floodfillId
     *         in: path
     *         required: true
     *         schema:
     *           type: integer
     *           format: int32
     *     responses:
     *       "200":
     *         description: successful operation
     *         content:
     *           application/json:
     *             schema:
     *               $ref: "#/components/schemas/FloodFill"
     *       "404":
     *         description: FloodFill not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: "#/components/schemas/Error"
     */
    app.get('/floodfills/:floodfillId', asyncHandler(async (req, res) => {
      try {
        res.json(await service.get(req.headers.userid, req.params.floodfillId));
      } catch (error) {
        if (error instanceof FloodFillNotFoundError) throw new ExpressError(404, error.message);
        throw error;
      }
    }));

    /**
     * @openapi
     * "/floodfills/{floodfillId}":
     *   put:
     *     summary: Updates a floodfill
     *     operationId: UpdateFloodFill
     *     tags: [ FloodFills ]
     *     parameters:
    *       - name: userid
     *         in: header
     *         required: true
     *         schema:
     *           type: string
     *       - name: floodfillId
     *         in: path
     *         required: true
     *         schema:
     *           type: integer
     *           format: int32
     *     requestBody:
     *       content:
     *         application/json:
     *           schema:
     *             $ref: "#/components/schemas/FloodFillUpdate"
     *     responses:
     *       "200":
     *         description: successful operation
     *         content:
     *           application/json:
     *             schema:
     *               $ref: "#/components/schemas/FloodFill"
     *       "404":
     *         description: FloodFill not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: "#/components/schemas/Error"
     */
    app.put('/floodfills/:floodfillId', asyncHandler(async (req, res) => {
      try {
        await service.update(req.headers.userid, req.params.floodfillId, req.body);
        res.json(await service.get(req.headers.userid, req.params.floodfillId));
        res.sendStatus(200);
      } catch (error) {
        if (error instanceof FloodFillNotFoundError) throw new ExpressError(404, error.message);
        throw error;
      }
    }));    

    /**
     * @openapi
     * "/floodfills/{floodfillId}":
     *   delete:
     *     summary: Deletes a floodfill
     *     operationId: DeleteFloodFill
     *     tags: [ FloodFills ]
     *     parameters:
    *       - name: userid
     *         in: header
     *         required: true
     *         schema:
     *           type: string
     *       - name: floodfillId
     *         in: path
     *         required: true
     *         schema:
     *           type: integer
     *           format: int32
     *     responses:
     *       "200":
     *         description: successful operation
     */
    app.delete('/floodfills/:floodfillId', asyncHandler(async (req, res) => {
      try {
        await service.delete(req.headers.userid, req.params.floodfillId);
        res.sendStatus(200)
      } catch (error) {
        if (error instanceof FloodFillNotFoundError) throw new ExpressError(404, error.message);
        throw error;
      }
    }));     
  }
}
