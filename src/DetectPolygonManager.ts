interface PolygonData {
  id?: number;
  polygon: number[][];
  minimalChangePercent: number;
  maximalChangePercent: number;
  triggerThreshold: number;
  colorThreshold: number;
}

interface GeneralSettings {
  allowNextTrigger: number;
  resetTimerOnEvent: boolean;
  noiseFilterRange: number;
}

class DetectPolygonManager {
  private canvas: HTMLCanvasElement | null;

  private context: CanvasRenderingContext2D | null;

  private contextMenu: HTMLDivElement | null;

  private POINT_RADIUS = 5;

  private generalSettings: GeneralSettings = {
    allowNextTrigger: 10,
    resetTimerOnEvent: true,
    noiseFilterRange: 3,
  };

  private polygonsData: PolygonData[] = [];

  private polygonsList: number[][][] = [];

  private centersList: number[][] = [];

  private mouseDisable = true;

  private polygonsHidden = false;

  private marginTop = 0;

  private marginBottom = 0;

  private marginLeft = 0;

  private marginRight = 0;

  private gridStep = 20;

  private videoWidth = 1280;

  private videoHeight = 720;

  private isMovingTop = false;

  private isMovingBottom = false;

  private isMovingLeft = false;

  private isMovingRight = false;

  private curentPolygonMenu = -1;

  private curentPolygon = -1;

  private curentPointIndex = -1;

  private movePointStart: number[] = [0, 0];

  private isMoving = false;

  constructor() {
    this.canvas = document.getElementById('polygonManager') as HTMLCanvasElement;
    this.context = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    this.contextMenu = document.getElementById('pm-context-menu') as HTMLDivElement;

    if (this.context == null) return;

    const clientRect = this.canvas.getBoundingClientRect();
    this.canvas.width = clientRect.width * devicePixelRatio;
    this.canvas.height = clientRect.height * devicePixelRatio;
    this.context.scale(devicePixelRatio, devicePixelRatio);
    this.canvas.style.width = clientRect.width.toString() + 'px';
    this.canvas.style.height = clientRect.height.toString() + 'px';

    this.addPolygon();
    this.enableMouse();
    this.createUserCanvasEvents();
    // this.createUserContextMenuEvents();
    // this.calculateMargin();
    this.render();
  }

  public setVideoQuality(width: number, height: number) {
    this.videoHeight = height;
    this.videoWidth = width;
    // this.calculateMargin();
    this.render();
  }

  // private calculateMargin() {
  //   if (this.canvas == undefined) return;
  //   if (this.videoWidth > this.videoHeight) {
  //     this.marginLeft = 0;
  //     this.marginRight = 0;
  //     this.marginBottom = this.marginTop =
  //       (this.canvas.height - (this.canvas.width / this.videoWidth) * this.videoHeight) / (devicePixelRatio * 2);
  //     return;
  //   }
  //   if (this.videoWidth <= this.videoHeight) {
  //     this.marginTop = 0;
  //     this.marginBottom = 0;
  //     this.marginLeft = this.marginRight =
  //       (this.canvas.width - (this.canvas.height / this.videoHeight) * this.videoWidth) / (devicePixelRatio * 2);
  //     return;
  //   }
  // }

  public addPolygon() {
    const newPolygon: number[][] = [
      [50, 100],
      [150, 100],
      [150, 200],
      [50, 200],
    ];
    this.polygonsList.push(newPolygon);
    this.centersList.push(this.calculatePolygonCenter(newPolygon));
    this.render();

    const defaultPolygonSettings: PolygonData = {
      polygon: newPolygon,
      minimalChangePercent: 20,
      maximalChangePercent: 40,
      triggerThreshold: 20,
      colorThreshold: 3,
    };

    this.polygonsData.push(defaultPolygonSettings);
  }

  public getCurrentPolygonIdMenu() {
    return this.curentPolygonMenu;
  }

  public removePolygon(id: number) {
    this.polygonsList.splice(id, 1);
    this.centersList.splice(id, 1);
    this.polygonsData.splice(id, 1);
    this.render();
  }

  public removeAllPolygons() {
    this.polygonsList = [];
    this.centersList = [];
    this.polygonsData = [];
    this.render();
  }

  public enableMouse() {
    this.mouseDisable = false;
  }

  public disableMouse() {
    this.mouseDisable = true;
  }

  public hidePolygons() {
    this.polygonsHidden = true;
    this.render();
  }

  public showPolygons() {
    this.polygonsHidden = false;
    this.render();
  }

  public getPolygonPoints() {
    return this.polygonsList[0];
  }

  private clearCanvas() {
    if (this.context == null) return;
    this.context.clearRect(0, 0, 900, 700);
  }

  private render() {
    this.clearCanvas();
    this.drawMargin();
    if (!this.polygonsHidden) this.drawPolygons();
    if (!this.polygonsHidden) this.drawCenters();
  }

  private drawPoints() {
    if (this.context == null) return;

    const ctx = this.context;
    const points = this.polygonsList;

    ctx.fillStyle = 'orange';
    ctx.strokeStyle = 'black';

    for (const polygon of points) {
      for (let i = 0; i < polygon.length; i++) {
        ctx.beginPath();
        ctx.arc(polygon[i][0], polygon[i][1], this.POINT_RADIUS, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
      }
    }
  }

  private drawPolylines() {
    if (this.context == null) return;

    const ctx = this.context;
    const points = this.polygonsList;

    ctx.strokeStyle = 'black';

    points.forEach((polygon, index) => {
      ctx.beginPath();
      ctx.moveTo(polygon[0][0], polygon[0][1]);

      for (let i = 0; i < polygon.length; i++) {
        if (i === polygon.length - 1) {
          ctx.lineTo(polygon[0][0], polygon[0][1]);
        } else {
          ctx.lineTo(polygon[i + 1][0], polygon[i + 1][1]);
        }
      }
      ctx.fillStyle = '#91ce3b4a';
      if (index == this.curentPolygon || index == this.curentPolygonMenu) ctx.fillStyle = '#E1FF24';

      ctx.fill();
      ctx.stroke();
    });
  }

  private drawCenters() {
    if (this.context == null) return;

    const ctx = this.context;
    const centers = this.centersList;

    centers.forEach((center) => {
      ctx.fillStyle = '#FF531C';

      ctx.beginPath();
      ctx.arc(center[0], center[1], this.POINT_RADIUS, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.fill();
      ctx.closePath();
    });
  }

  private drawPolygons() {
    this.drawPolylines();
    this.drawPoints();
  }

  public setGridStep(size: number) {
    this.gridStep = size;
    this.render();
  }

  private drawMargin() {
    const canvas = this.canvas;
    const ctx = this.context;

    if (canvas == null || ctx == null) return;

    const top = this.marginTop;
    const bottom = this.marginBottom;
    const left = this.marginLeft;
    const right = this.marginRight;

    const cnavasWidth = canvas.width / devicePixelRatio;
    const cnavasHeight = canvas.height / devicePixelRatio;

    for (let x = 0; x < cnavasWidth; x += this.gridStep) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, cnavasHeight);
    }

    for (let y = 0; y < cnavasHeight; y += this.gridStep) {
      ctx.moveTo(0, y);
      ctx.lineTo(cnavasWidth, y);
    }

    ctx.strokeStyle = '#00C1FF';
    ctx.stroke();

    // ctx.clearRect(left, top, cnavasWidth - (left + right), cnavasHeight - (top + bottom));
    // ctx.beginPath();
    // ctx.rect(left, top, cnavasWidth - (left + right), cnavasHeight - (bottom + top));
    // ctx.stroke();
  }

  private movePolygon(polygonId: number, dx: number, dy: number) {
    const points = this.polygonsList;
    const centers = this.centersList;

    centers[polygonId][0] += dx;
    centers[polygonId][1] += dy;

    for (const point of points[polygonId]) {
      point[0] += dx;
      point[1] += dy;
    }
  }

  private calculatePolygonCenter(polygon: number[][]): number[] {
    const pointsNumber = polygon.length;

    let minX: number = polygon[0][0];
    let maxX: number = polygon[0][0];
    let minY: number = polygon[0][1];
    let maxY: number = polygon[0][1];

    for (let i = 0; i < pointsNumber; i++) {
      minX = Math.min(minX, polygon[i][0]);
      maxX = Math.max(maxX, polygon[i][0]);
      minY = Math.min(minY, polygon[i][1]);
      maxY = Math.max(maxY, polygon[i][1]);
    }

    return [minX + (maxX - minX) / 2, minY + (maxY - minY) / 2];
  }

  private moveCurrentPoint(x: number, y: number) {
    this.polygonsList[this.curentPolygon][this.curentPointIndex][0] = x;
    this.polygonsList[this.curentPolygon][this.curentPointIndex][1] = y;
    this.render();
  }

  private addPoint(polygonId: number, pointId: number, x: number, y: number) {
    this.polygonsList[polygonId].splice(pointId, 0, [x, y]);
    this.render();
  }

  private removePoint(polygonId: number, pointId: number) {
    if (this.polygonsList[polygonId].length < 4) return;
    this.polygonsList[polygonId].splice(pointId, 1);
    this.render();
  }

  private coverPoint(x: number, y: number): number[] {
    // Функция вернет [polygonId, pointId]  или [-1, -1]

    const points = this.polygonsList;
    const radius = this.POINT_RADIUS;
    let polygonId = 0;
    let pointId: number;
    for (const polygon of points) {
      pointId = 0;
      for (const point of polygon) {
        if (x > point[0] - radius && x < point[0] + radius && y > point[1] - radius && y < point[1] + radius) {
          return [polygonId, pointId];
        }
        pointId++;
      }
      polygonId++;
    }

    return [-1, -1];
  }

  private coverLine(Cx: number, Cy: number): number[] {
    // Функция вернет индекс линии (индекс точки из которой линия выходит) или -1
    const points = this.polygonsList;
    const radius = this.POINT_RADIUS;

    let Ax: number;
    let Ay: number;
    let Bx: number;
    let By: number;
    let AB: number;
    let BC: number;
    let AC: number;
    let cosABC: number;
    let sinABC: number;
    let heightC: number;

    let polygonId = 0;
    let pointId: number;

    for (const polygon of points) {
      pointId = 0;
      for (const point of polygon) {
        Ax = point[0];
        Ay = point[1];
        if (pointId === polygon.length - 1) {
          Bx = polygon[0][0];
          By = polygon[0][1];
        } else {
          Bx = polygon[pointId + 1][0];
          By = polygon[pointId + 1][1];
        }
        AB = Math.sqrt(Math.pow(Bx - Ax, 2) + Math.pow(By - Ay, 2));
        BC = Math.sqrt(Math.pow(Bx - Cx, 2) + Math.pow(By - Cy, 2));
        AC = Math.sqrt(Math.pow(Cx - Ax, 2) + Math.pow(Cy - Ay, 2));
        cosABC = (BC * BC + AB * AB - AC * AC) / (2 * BC * AB);
        sinABC = Math.sqrt(1 - cosABC ** 2);
        heightC = AC * sinABC;

        if (heightC < radius && BC > 30 && AC > 30 && BC < AB && AC < AB) {
          return [polygonId, pointId + 1];
        }
        pointId++;
      }
      polygonId++;
    }
    return [-1, -1];
  }

  private coverCenter(x: number, y: number): number {
    const centers = this.centersList;
    let centerId = 0;

    for (const center of centers) {
      if (x > center[0] - 10 && x < center[0] + 10 && y > center[1] - 10 && y < center[1] + 10) {
        return centerId;
      }
      centerId++;
    }
    return -1;
  }

  private calculateContextMenuPosition(mouseX: number, mouseY: number): number[] {
    if (this.canvas == null || this.contextMenu == null) return [mouseX, mouseY];

    let offsetX = mouseX;
    let offsetY = mouseY;

    const cnavasWidth = this.canvas.width / devicePixelRatio;
    const cnavasHeight = this.canvas.height / devicePixelRatio;

    const menuWidth = 130;
    const menuHeight = 64;

    const dx = mouseX + menuWidth - cnavasWidth;
    const dy = mouseY + menuHeight - cnavasHeight;

    if (dx > 0) offsetX += -dx;

    if (dy > 0) offsetY += -dy;

    return [offsetX, offsetY];
  }

  private contextMenuEventHandler = (e: MouseEvent) => {
    e.preventDefault();

    if (this.contextMenu == null) return;

    let offsetX = (e as MouseEvent).offsetX;
    let offsetY = (e as MouseEvent).offsetY;

    this.curentPolygonMenu = this.coverCenter(offsetX, offsetY);
    if (this.curentPolygonMenu == -1) return;
    this.curentPolygon = -1;
    this.render();

    [offsetX, offsetY] = this.calculateContextMenuPosition(offsetX, offsetY);

    this.contextMenu.style.display = 'initial';
    this.contextMenu.style.top = `${offsetY}px`;
    this.contextMenu.style.left = `${offsetX}px`;
  };

  private mouseDownEventHandler = (e: MouseEvent | TouchEvent) => {
    if (this.canvas == null || this.context == null) return;
    if (this.mouseDisable) return;

    e.preventDefault();
    this.hideContextMenu();

    if ((e as MouseEvent).button == 1 || (e as MouseEvent).button == 2) return;

    const mouseX = (e as MouseEvent).offsetX;
    const mouseY = (e as MouseEvent).offsetY;

    const coverPolygonCenter: number = this.coverCenter(mouseX, mouseY);

    if (!this.polygonsHidden) {
      if (coverPolygonCenter != -1) {
        this.curentPolygonMenu = -1;
        this.movePointStart = [mouseX, mouseY];
        this.curentPolygon = coverPolygonCenter;
        this.render();
        this.isMoving = true;
        this.canvas.style.cursor = 'move';
        return;
      }

      const coverPoint: number[] = this.coverPoint(mouseX, mouseY);

      if (coverPoint[0] != -1) {
        if ((e as MouseEvent).shiftKey) {
          console.log(e);
          this.removePoint(coverPoint[0], coverPoint[1]);
        }

        this.curentPolygonMenu = -1;
        this.curentPolygon = coverPoint[0];
        this.curentPointIndex = coverPoint[1];
        this.canvas.style.cursor = 'grabbing';
        this.render();
        return;
      }

      const coverLineIndex: number[] = this.coverLine(mouseX, mouseY);
      if (coverLineIndex[0] != -1) {
        this.curentPolygonMenu = -1;
        this.curentPolygon = coverLineIndex[0];

        this.addPoint(coverLineIndex[0], coverLineIndex[1], mouseX, mouseY);
        return;
      }
    }

    {
      if (mouseX < this.marginLeft + 7 && mouseX > this.marginLeft - 7) {
        this.canvas.style.cursor = 'col-resize';
        this.isMovingLeft = true;
        return;
      }
      if (
        mouseX < this.canvas.width / devicePixelRatio - this.marginRight + 7 &&
        mouseX > this.canvas.width / devicePixelRatio - this.marginRight - 7
      ) {
        this.canvas.style.cursor = 'col-resize';
        this.isMovingRight = true;
        return;
      }
      if (mouseY < this.marginTop + 7 && mouseY > this.marginTop - 7) {
        this.canvas.style.cursor = 'row-resize';
        this.isMovingTop = true;
        return;
      }

      if (
        mouseY < this.canvas.height / devicePixelRatio - this.marginBottom + 7 &&
        mouseY > this.canvas.height / devicePixelRatio - this.marginBottom - 7
      ) {
        this.canvas.style.cursor = 'row-resize';
        this.isMovingBottom = true;
        return;
      }
    }
  };

  private mouseUpEventHandler = (e: MouseEvent | TouchEvent) => {
    e.preventDefault();

    if (this.canvas != null) this.canvas.style.cursor = 'auto';

    this.curentPointIndex = -1;
    this.isMoving = false;
    this.isMovingLeft = false;
    this.isMovingRight = false;
    this.isMovingTop = false;
    this.isMovingBottom = false;
  };

  private mouseMoveEventHandler = (e: MouseEvent | TouchEvent) => {
    if (this.canvas == null || this.context == null) return;
    e.preventDefault();
    this.hideContextMenu();

    const mouseX = (e as MouseEvent).offsetX;
    const mouseY = (e as MouseEvent).offsetY;

    if (this.isMovingLeft) {
      this.marginLeft = mouseX;
      this.render();

      return;
    }
    if (this.isMovingRight) {
      this.marginRight = -mouseX + this.canvas.width / devicePixelRatio;
      this.render();

      return;
    }
    if (this.isMovingTop) {
      this.marginTop = mouseY;
      this.render();

      return;
    }
    if (this.isMovingBottom) {
      this.marginBottom = -mouseY + this.canvas.height / devicePixelRatio;
      this.render();

      return;
    }

    if (this.isMoving) {
      this.movePolygon(this.curentPolygon, mouseX - this.movePointStart[0], mouseY - this.movePointStart[1]);
      this.movePointStart[0] = mouseX;
      this.movePointStart[1] = mouseY;
      this.render();
    }

    if (this.curentPointIndex == -1) return;
    this.moveCurrentPoint(mouseX, mouseY);
    this.centersList[this.curentPolygon] = this.calculatePolygonCenter(this.polygonsList[this.curentPolygon]);
  };

  private hideContextMenu() {
    if (this.contextMenu != null) this.contextMenu.style.display = 'none';
  }

  private deleteButtonClickEventHandler = (e: MouseEvent) => {
    console.log(this.curentPolygonMenu);
    this.removePolygon(this.curentPolygonMenu);
    this.curentPolygonMenu = -1;
    this.curentPolygon = -1;
    this.hideContextMenu();
    this.render();
  };

  private openOptionsButtonClickEventHandler = (e: MouseEvent) => {};

  private createUserCanvasEvents() {
    const canvas = this.canvas;

    canvas?.addEventListener('mousedown', this.mouseDownEventHandler);
    canvas?.addEventListener('mouseup', this.mouseUpEventHandler);
    canvas?.addEventListener('mousemove', this.mouseMoveEventHandler);
    canvas?.addEventListener('contextmenu', this.contextMenuEventHandler);
    canvas?.addEventListener('mouseleave', this.mouseUpEventHandler);
  }

  // private createUserContextMenuEvents() {
  //   const deleteButton = document.getElementById('deletePolygon') as HTMLButtonElement;
  //   const openOptionsButton = document.getElementById('openPolygonOptions') as HTMLButtonElement;

  //   deleteButton.addEventListener('click', this.deleteButtonClickEventHandler);
  //   openOptionsButton.addEventListener('click', this.openOptionsButtonClickEventHandler);
  // }
}

export { DetectPolygonManager };
